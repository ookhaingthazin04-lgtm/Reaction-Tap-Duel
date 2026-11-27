// Test surrender functionality
// This test verifies that when a player surrenders, the game correctly
// determines the winner based on scores (not just because someone surrendered)

const { io } = require('socket.io-client');
const http = require('http');
const WebSocket = require('ws');

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

async function testSurrenderWinner() {
  console.log('=== TEST SURRENDER WINNER ===');
  console.log('\n--- Player 1 setup ---');

  // Player 1 registration and login
  try {
    const regResp = await httpRequest('POST', '/api/auth/register', {
      username: 'surrender_test_p1',
      email: 'p1@test.com',
      password: 'password123'
    });
    console.log('[P1] Register:', regResp.status);
  } catch (e) {
    console.log('[P1] Register: already exists');
  }

  const loginResp = await httpRequest('POST', '/api/auth/login', {
    username: 'surrender_test_p1',
    password: 'password123'
  });
  console.log('[P1] Login:', loginResp.status, loginResp.body);
  const loginData = JSON.parse(loginResp.body);
  const sessionCookie1 = loginResp.setCookie ? loginResp.setCookie[0] : null;
  const userId1 = loginData.user.id;

  // Connect Player 1 socket
  const socket1 = io(API_BASE, {
    auth: { sessionID: sessionCookie1 },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  let roomCode = null;
  let p1GameEnded = false;
  let p1GameEndedWinner = null;

  socket1.on('connect', () => console.log('[P1] Socket connected'));
  socket1.on('connect_error', (err) => console.log('[P1] Connect error:', err.message));
  socket1.on('room_updated', (data) => {
    console.log('[P1] room_updated: players=', data.players?.length, 'status=', data.status);
    if (!roomCode && data.roomCode) roomCode = data.roomCode;
  });
  socket1.on('game_ended', (data) => {
    console.log('[P1] game_ended: winner=', data.winner, 'reason=', data.reason);
    p1GameEnded = true;
    p1GameEndedWinner = data.winner;
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Create room
  await new Promise((resolve) => {
    socket1.emit('create_room', { userId: userId1, username: 'surrender_test_p1' }, (response) => {
      console.log('[P1] create_room:', JSON.stringify(response));
      if (response.success) roomCode = response.roomCode;
      resolve();
    });
  });

  console.log('\n--- Player 2 setup ---');

  // Player 2 registration and login
  try {
    const regResp = await httpRequest('POST', '/api/auth/register', {
      username: 'surrender_test_p2',
      email: 'p2@test.com',
      password: 'password123'
    });
    console.log('[P2] Register:', regResp.status);
  } catch (e) {
    console.log('[P2] Register: already exists');
  }

  const loginResp2 = await httpRequest('POST', '/api/auth/login', {
    username: 'surrender_test_p2',
    password: 'password123'
  });
  console.log('[P2] Login:', loginResp2.status, loginResp2.body);
  const loginData2 = JSON.parse(loginResp2.body);
  const sessionCookie2 = loginResp2.setCookie ? loginResp2.setCookie[0] : null;
  const userId2 = loginData2.user.id;

  // Connect Player 2 socket
  const socket2 = io(API_BASE, {
    auth: { sessionID: sessionCookie2 },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  let p2GameEnded = false;
  let p2GameEndedWinner = null;

  socket2.on('connect', () => console.log('[P2] Socket connected'));
  socket2.on('connect_error', (err) => console.log('[P2] Connect error:', err.message));
  socket2.on('room_updated', (data) => {
    console.log('[P2] room_updated: players=', data.players?.length, 'status=', data.status);
  });
  socket2.on('game_ended', (data) => {
    console.log('[P2] game_ended: winner=', data.winner, 'reason=', data.reason);
    p2GameEnded = true;
    p2GameEndedWinner = data.winner;
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Join room
  await new Promise((resolve) => {
    socket2.emit('join_room', { userId: userId2, username: 'surrender_test_p2', roomCode: roomCode }, (response) => {
      console.log('[P2] join_room:', JSON.stringify(response));
      resolve();
    });
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Both players ready
  console.log('\n--- Both players ready ---');
  await new Promise((resolve) => {
    socket1.emit('player_ready', { roomCode: roomCode, userId: userId1, playerNumber: 1, ready: true }, (response) => {
      console.log('[P1] player_ready:', JSON.stringify(response));
      resolve();
    });
  });

  await new Promise((resolve) => {
    socket2.emit('player_ready', { roomCode: roomCode, userId: userId2, playerNumber: 2, ready: true }, (response) => {
      console.log('[P2] player_ready:', JSON.stringify(response));
      resolve();
    });
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Start round - give player 1 advantage by setting score before game
  // We need to manually manipulate the server state
  console.log('\n--- Manual test - Setting up scores ---');

  // Get room id from players
  const roomResponse = await httpRequest('GET', `/api/rooms/${roomCode}`, null, sessionCookie1);
  if (roomResponse.status === 200) {
    const roomData = JSON.parse(roomResponse.body);
    const roomId = roomData.room.id;
    console.log('Room ID:', roomId);

    // Set up scores: Player 1 has 3, Player 2 has 1
    await httpRequest('PUT', `/api/rooms/${roomCode}/scores`, {
      roomId: roomId,
      scores: {
        1: 3,
        2: 1
      }
    }, sessionCookie1);

    console.log('Scores set: Player 1 = 3, Player 2 = 1');
  }

  // Wait a moment for the state to update
  await new Promise((r) => setTimeout(r, 2000));

  console.log('\n--- Player 2 surrenders ---');

  // Player 2 surrenders
  await new Promise((resolve) => {
    socket2.emit('game_ended', {
      roomCode: roomCode,
      userId: userId2,
      reason: 'surrender'
    }, (response) => {
      console.log('[P2] game_ended response:', JSON.stringify(response));
      resolve();
    });
  });

  await new Promise((r) => setTimeout(r, 2000));

  console.log('\n--- Verification ---');

  // Verify both players received the same result
  console.log('[P1] Received game_ended: winner=', p1GameEndedWinner);
  console.log('[P2] Received game_ended: winner=', p2GameEndedWinner);

  // Since Player 1 has higher score (3 > 1), they should win
  const expectedWinner = 1; // Player 1 has higher score

  if (p1GameEnded && p2GameEnded &&
      p1GameEndedWinner === expectedWinner &&
      p2GameEndedWinner === expectedWinner) {
    console.log('\n✅ TEST PASSED: Surrender correctly determines winner based on scores!');
    console.log('   Winner: Player', expectedWinner, '(higher score)');
  } else {
    console.log('\n❌ TEST FAILED:');
    console.log('   Expected winner: Player', expectedWinner);
    console.log('   P1 received: Player', p1GameEndedWinner);
    console.log('   P2 received: Player', p2GameEndedWinner);
  }

  socket1.disconnect();
  socket2.disconnect();

  return {
    success: p1GameEnded && p2GameEnded && p1GameEndedWinner === expectedWinner && p2GameEndedWinner === expectedWinner,
    p1Received: p1GameEndedWinner,
    p2Received: p2GameEndedWinner,
    expected: expectedWinner
  };
}

// Run the test
(async () => {
  try {
    const result = await testSurrenderWinner();
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    console.error('Test failed with error:', err.message);
    process.exit(1);
  }
})();