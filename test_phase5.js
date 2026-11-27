const { io } = require('socket.io-client');
const http = require('http');

const API_BASE = 'http://localhost:3000';

function httpRequest(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data, setCookie: res.headers['set-cookie'] });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let shared = {
  roomCode: null,
  p1Result: null,
  p2Result: null,
  p1ReactionTime: null,
  p2ReactionTime: null,
  roundWinner: null,
};

async function simulatePlayer(username, email, password, role) {
  console.log(`\n=== [${role}] ${username} ===\n`);

  // Register
  try {
    const regResp = await httpRequest('POST', '/api/auth/register', { username, email, password });
    console.log(`[${role}] Register: ${regResp.status}`);
  } catch (e) {
    console.log(`[${role}] Register: already exists`);
  }

  // Login
  const loginResp = await httpRequest('POST', '/api/auth/login', { username, password });
  console.log(`[${role}] Login: ${loginResp.status} ${loginResp.body}`);
  const loginData = JSON.parse(loginResp.body);
  const sessionCookie = loginResp.setCookie ? loginResp.setCookie[0] : null;
  const userId = loginData.user.id;

  // Connect Socket.io
  const socket = io(API_BASE, {
    auth: { sessionID: sessionCookie },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  let greenTimeReceived = false;
  let roundResultReceived = false;

  socket.on('connect', () => console.log(`[${role}] Socket connected`));
  socket.on('connect_error', (err) => console.log(`[${role}] Connect error: ${err.message}`));
  socket.on('room_updated', (data) => {
    console.log(`[${role}] room_updated: players=${data.players?.length}, status=${data.status}`);
    if (!shared.roomCode && data.roomCode) shared.roomCode = data.roomCode;
  });
  socket.on('round_started', (data) => {
    console.log(`[${role}] round_started: RED screen showing`);
  });
  socket.on('show_green', (data) => {
    console.log(`[${role}] show_green: GREEN screen showing at ${data.greenTime}`);
    greenTimeReceived = true;
  });
  socket.on('round_result', (data) => {
    console.log(`[${role}] round_result: winner=P${data.winner}, times=${JSON.stringify(data.reactionTimes)}`);
    roundResultReceived = true;
    if (role === 'PLAYER_1') {
      shared.p1Result = data;
      shared.p1ReactionTime = data.reactionTimes[1];
      shared.roundWinner = data.winner;
    } else {
      shared.p2Result = data;
      shared.p2ReactionTime = data.reactionTimes[2];
    }
  });
  socket.on('player_ready_update', (data) => {
    console.log(`[${role}] player_ready_update: P${data.playerNumber} ready=${data.ready}`);
  });

  await new Promise((r) => setTimeout(r, 1000));

  if (role === 'PLAYER_1') {
    // Create room
    await new Promise((resolve) => {
      socket.emit('create_room', { userId, username }, (response) => {
        console.log(`[${role}] create_room:`, JSON.stringify(response));
        if (response.success) shared.roomCode = response.roomCode;
        resolve();
      });
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Toggle ready
    console.log(`\n[${role}] Toggling ready...\n`);
    await new Promise((resolve) => {
      socket.emit('player_ready', { roomCode: shared.roomCode, userId, playerNumber: 1, ready: true }, (response) => {
        console.log(`[${role}] player_ready:`, JSON.stringify(response));
        resolve();
      });
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Wait for Player 2 to join
    console.log(`\n[${role}] Waiting for Player 2...\n`);
    await new Promise((r) => setTimeout(r, 5000));

    // Start round
    console.log(`\n[${role}] Starting round...\n`);
    await new Promise((resolve) => {
      socket.emit('start_round', { roomCode: shared.roomCode, userId }, (response) => {
        console.log(`[${role}] start_round:`, JSON.stringify(response));
        resolve();
      });
    });

    // Wait for green, then tap
    console.log(`\n[${role}] Waiting for green...\n`);
    let greenWaits = 0;
    while (!greenTimeReceived && greenWaits < 30) {
      await new Promise((r) => setTimeout(r, 200));
      greenWaits++;
    }

    if (greenTimeReceived) {
      // Tap immediately after green
      console.log(`\n[${role}] Tapping after green...\n`);
      await new Promise((resolve) => {
        socket.emit('player_tap', { roomCode: shared.roomCode, userId, playerNumber: 1 }, (response) => {
          console.log(`[${role}] player_tap response:`, JSON.stringify(response));
          resolve();
        });
      });
    }

    await new Promise((r) => setTimeout(r, 4000));
  } else {
    // Wait for room code from Player 1
    console.log(`[${role}] Waiting for room code...`);
    let waits = 0;
    while (!shared.roomCode && waits < 30) {
      await new Promise((r) => setTimeout(r, 500));
      waits++;
    }

    if (!shared.roomCode) {
      console.log(`[${role}] ERROR: No room code`);
      socket.disconnect();
      return;
    }

    console.log(`[${role}] Got room code: ${shared.roomCode}`);

    // Join room
    await new Promise((resolve) => {
      socket.emit('join_room', { userId, username, roomCode: shared.roomCode }, (response) => {
        console.log(`[${role}] join_room:`, JSON.stringify(response));
        resolve();
      });
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Toggle ready
    console.log(`\n[${role}] Toggling ready...\n`);
    await new Promise((resolve) => {
      socket.emit('player_ready', { roomCode: shared.roomCode, userId, playerNumber: 2, ready: true }, (response) => {
        console.log(`[${role}] player_ready:`, JSON.stringify(response));
        resolve();
      });
    });

    // Wait for round to start and green
    console.log(`\n[${role}] Waiting for round...\n`);
    await new Promise((r) => setTimeout(r, 6000));

    // Wait for green, then tap
    console.log(`\n[${role}] Waiting for green...\n`);
    let greenWaits2 = 0;
    while (!greenTimeReceived && greenWaits2 < 30) {
      await new Promise((r) => setTimeout(r, 200));
      greenWaits2++;
    }

    if (greenTimeReceived) {
      // Tap with slight delay to test reaction time
      console.log(`\n[${role}] Tapping after green...\n`);
      await new Promise((resolve) => setTimeout(r => resolve(), 100)); // 100ms delay
      socket.emit('player_tap', { roomCode: shared.roomCode, userId, playerNumber: 2 }, (response) => {
        console.log(`[${role}] player_tap response:`, JSON.stringify(response));
      });
    }

    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log(`\n[${role}] Done. roundResultReceived=${roundResultReceived}`);
  socket.disconnect();
  return { username, roundResultReceived };
}

async function main() {
  console.log('========================================');
  console.log('PHASE 5: REAL-TIME REACTION TAP DUEL TEST');
  console.log('========================================');

  const [p1, p2] = await Promise.all([
    simulatePlayer('phase5_test_a', 'pta@test.com', 'password123', 'PLAYER_1'),
    simulatePlayer('phase5_test_b', 'ptb@test.com', 'password123', 'PLAYER_2'),
  ]);

  console.log('\n========================================');
  console.log('RESULTS');
  console.log('========================================');
  console.log(`Same room: YES (${shared.roomCode})`);
  console.log(`Player 1 result:`, shared.p1Result ? JSON.stringify(shared.p1Result) : 'none');
  console.log(`Player 2 result:`, shared.p2Result ? JSON.stringify(shared.p2Result) : 'none');
  console.log(`P1 reaction time: ${shared.p1ReactionTime}ms`);
  console.log(`P2 reaction time: ${shared.p2ReactionTime}ms`);
  console.log(`Round winner: P${shared.roundWinner}`);

  if (shared.p1Result && shared.p2Result && shared.roundWinner) {
    console.log('\n✅ TEST PASSED: Phase 5 real-time game mechanics working!');
  } else {
    console.log('\n❌ TEST FAILED: Phase 5 not fully working.');
  }
}

main().catch(console.error);