require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db/config');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');

// Track active game rooms for synchronized gameplay
const activeGames = new Map(); // roomCode -> game state

// Track rematch requests per room: roomCode -> Set of userIds
const rematchRequests = new Map();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'file://'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'reaction_tap_duel_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Leaderboard route - ranked by total wins
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username,
              COALESCE(w.wins, 0) as wins,
              COALESCE(l.losses, 0) as losses,
              COALESCE(w.wins, 0) + COALESCE(l.losses, 0) as total_games
       FROM users u
       LEFT JOIN (
         SELECT winner_id as user_id, COUNT(*) as wins
         FROM matches
         GROUP BY winner_id
       ) w ON u.id = w.user_id
LEFT JOIN (
          SELECT mp.user_id, COUNT(*) as losses
          FROM match_players mp
          JOIN matches m ON m.room_id = mp.match_id
          WHERE m.winner_id IS NOT NULL AND m.winner_id != mp.user_id
          GROUP BY mp.user_id
        ) l ON u.id = l.user_id
       ORDER BY wins DESC, total_games DESC
       LIMIT 50`
    );
    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Match history route
app.get('/api/match-history', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.session.userId;

    const result = await pool.query(
      `SELECT m.id, m.created_at, m.winner_id, m.p1_score, m.p2_score,
               u1.username as player1_name,
               u2.username as player2_name,
               mp1.user_id as player1_id,
               mp2.user_id as player2_id,
               mp1.best_reaction_time as p1_reaction_time,
               mp2.best_reaction_time as p2_reaction_time,
               CASE WHEN m.winner_id = mp1.user_id THEN u1.username ELSE u2.username END as winner_name,
               CASE WHEN m.winner_id = $1 THEN 'Win' WHEN m.winner_id IS NULL THEN 'Draw' ELSE 'Loss' END as my_result
        FROM matches m
        JOIN match_players mp1 ON m.room_id = mp1.match_id AND mp1.player_number = 1
        JOIN match_players mp2 ON m.room_id = mp2.match_id AND mp2.player_number = 2
        JOIN users u1 ON mp1.user_id = u1.id
        JOIN users u2 ON mp2.user_id = u2.id
        WHERE mp1.user_id = $1 OR mp2.user_id = $1
        ORDER BY m.created_at DESC
        LIMIT 50`,
      [userId]
    );
    res.json({ matches: result.rows });
  } catch (err) {
    console.error('Match history error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/settings/sound', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.session.userId;

    const result = await pool.query(
      'SELECT sound_enabled, volume, music_enabled, music_volume FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Return defaults if no settings exist yet
      return res.json({ sound_enabled: true, volume: 0.7, music_enabled: true, music_volume: 0.5 });
    }

    res.json({ sound_enabled: result.rows[0].sound_enabled, volume: parseFloat(result.rows[0].volume), music_enabled: result.rows[0].music_enabled, music_volume: parseFloat(result.rows[0].music_volume) });
  } catch (err) {
    console.error('Get sound settings error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings/sound', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.session.userId;
    const { sound_enabled, volume, music_enabled, music_volume } = req.body;

    if (sound_enabled === undefined && volume === undefined && music_enabled === undefined && music_volume === undefined) {
      return res.status(400).json({ error: 'No settings provided' });
    }

    const existing = await pool.query(
      'SELECT id FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO user_settings (user_id, sound_enabled, volume, music_enabled, music_volume) VALUES ($1, $2, $3, $4, $5)',
        [userId, sound_enabled !== undefined ? sound_enabled : true, volume !== undefined ? volume : 0.7, music_enabled !== undefined ? music_enabled : true, music_volume !== undefined ? music_volume : 0.5]
      );
    } else {
      const updates = [];
      const values = [];
      let paramIdx = 1;

      if (sound_enabled !== undefined) {
        updates.push(`sound_enabled = $${paramIdx++}`);
        values.push(sound_enabled);
      }
      if (volume !== undefined) {
        updates.push(`volume = $${paramIdx++}`);
        values.push(volume);
      }
      if (music_enabled !== undefined) {
        updates.push(`music_enabled = $${paramIdx++}`);
        values.push(music_enabled);
      }
      if (music_volume !== undefined) {
        updates.push(`music_volume = $${paramIdx++}`);
        values.push(music_volume);
      }
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      await pool.query(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = $${paramIdx}`,
        values
      );
    }

    res.json({ success: true, sound_enabled, volume, music_enabled, music_volume });
  } catch (err) {
    console.error('Update sound settings error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.session.userId;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get match stats from matches table (winner_id = userId = wins)
const matchStatsResult = await pool.query(
      `SELECT 
          COUNT(DISTINCT m.id) as total_games,
          COUNT(DISTINCT CASE WHEN m.winner_id = $1 THEN m.id END) as wins,
          COUNT(DISTINCT CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != $1 THEN m.id END) as losses
        FROM matches m
        JOIN match_players mp ON m.room_id = mp.match_id
        WHERE mp.user_id = $1`,
      [userId]
    );

    const stats = matchStatsResult.rows[0];
    const totalGames = parseInt(stats.total_games) || 0;
    const wins = parseInt(stats.wins) || 0;
    const losses = parseInt(stats.losses) || 0;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

    // Get best reaction time
    const bestTimeResult = await pool.query(
      'SELECT MAX(best_reaction_time) as best_reaction_time FROM match_players WHERE user_id = $1 AND best_reaction_time IS NOT NULL',
      [userId]
    );
    const bestReactionTime = bestTimeResult.rows[0].best_reaction_time || null;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        member_since: user.created_at,
      },
      stats: {
        total_games: totalGames,
        wins: wins,
        losses: losses,
        win_rate: winRate,
        best_reaction_time: bestReactionTime,
      },
    });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Server error loading profile' });
  }
});

app.get('/api/session', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, userId: req.session.userId, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'file://'],
    credentials: true,
  },
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID || socket.handshake.headers.cookie;
  if (!sessionID) {
    return next(new Error('Authentication required'));
  }
  next();
});

io.on('connection', (socket) => {
  console.log('[Socket] Client connected:', socket.id);

  socket.on('create_room', async (data, callback) => {
    try {
      const { userId, username } = data;
      const roomCode = generateRoomCode();

      const result = await pool.query(
        'INSERT INTO game_rooms (room_code, status) VALUES ($1, $2) RETURNING id, room_code, status',
        [roomCode, 'waiting']
      );

      const room = result.rows[0];

      await pool.query(
        'INSERT INTO match_players (match_id, user_id, player_number, score, joined_at) VALUES ($1, $2, $3, $4, $5)',
        [room.id, userId, 1, 0, new Date()]
      );

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userId = userId;
      socket.data.playerNumber = 1;

      callback({ success: true, roomCode, roomId: room.id, playerNumber: 1, username });
      socket.to(roomCode).emit('room_updated', { roomCode, player1: username, player2: null, status: 'waiting' });
    } catch (err) {
      console.error('[Socket] Create room error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('join_room', async (data, callback) => {
    try {
      const { userId, username, roomCode } = data;

      const roomResult = await pool.query(
        'SELECT id, room_code, status FROM game_rooms WHERE room_code = $1',
        [roomCode]
      );

      if (roomResult.rows.length === 0) {
        return callback({ success: false, error: 'Room not found' });
      }

      const room = roomResult.rows[0];

      if (room.status !== 'waiting') {
        return callback({ success: false, error: 'Room is not accepting players' });
      }

      const playerCountResult = await pool.query(
        'SELECT COUNT(*) as count FROM match_players WHERE match_id = $1',
        [room.id]
      );

      if (parseInt(playerCountResult.rows[0].count) >= 2) {
        return callback({ success: false, error: 'Room is full' });
      }

      const playerNumber = parseInt(playerCountResult.rows[0].count) + 1;

      await pool.query(
        'INSERT INTO match_players (match_id, user_id, player_number, score, joined_at) VALUES ($1, $2, $3, $4, $5)',
        [room.id, userId, playerNumber, 0, new Date()]
      );

      const playersResult = await pool.query(
        `SELECT mp.player_number, u.username, u.id
         FROM match_players mp
         JOIN users u ON mp.user_id = u.id
         WHERE mp.match_id = $1
         ORDER BY mp.player_number`,
        [room.id]
      );

      const players = playersResult.rows;

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userId = userId;
      socket.data.playerNumber = playerNumber;

      if (playerNumber === 2) {
        await pool.query(
          'UPDATE game_rooms SET status = $1 WHERE id = $2',
          ['active', room.id]
        );
      }

      callback({
        success: true,
        roomCode,
        roomId: room.id,
        playerNumber,
        username,
        players,
      });

      io.to(roomCode).emit('room_updated', {
        roomCode,
        players,
        status: playerNumber === 2 ? 'active' : 'waiting',
      });
    } catch (err) {
      console.error('[Socket] Join room error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('player_ready', async (data, callback) => {
    try {
      const { roomCode, userId, playerNumber, ready } = data;

      await pool.query(
        `UPDATE match_players SET ready = $1 WHERE match_id = (SELECT id FROM game_rooms WHERE room_code = $2) AND user_id = $3`,
        [ready, roomCode, userId]
      );

      io.to(roomCode).emit('player_ready_update', { userId, playerNumber, ready });
      callback({ success: true });
    } catch (err) {
      console.error('[Socket] Player ready error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('start_game', async (data, callback) => {
    try {
      const { roomCode, userId } = data;

      // Verify both players are in the room
      const playerCountResult = await pool.query(
        'SELECT COUNT(*) as count FROM match_players WHERE match_id = (SELECT id FROM game_rooms WHERE room_code = $1)',
        [roomCode]
      );

      if (parseInt(playerCountResult.rows[0].count) < 2) {
        return callback({ success: false, error: 'Room needs 2 players to start' });
      }

      // Verify both players are ready
      const readyResult = await pool.query(
        `SELECT COUNT(*) as ready_count FROM match_players mp
         JOIN game_rooms gr ON mp.match_id = gr.id
         WHERE gr.room_code = $1 AND mp.ready = true`,
        [roomCode]
      );

      if (parseInt(readyResult.rows[0].ready_count) < 2) {
        return callback({ success: false, error: 'Both players must be ready' });
      }

      // Emit game_started to all players in the room
      io.to(roomCode).emit('game_started', { roomCode, startedBy: userId });
      callback({ success: true });
    } catch (err) {
      console.error('[Socket] Start game error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  // Start a new round: RED immediately, random delay 2-5s, then GREEN, then 10s tap window
  socket.on('start_round', async (data, callback) => {
    try {
      const { roomCode, userId, roundId } = data;
      console.log('[Socket] start_round called:', { roomCode, userId, socketId: socket.id });

      // Verify both players are in the room
      const playerCountResult = await pool.query(
        'SELECT COUNT(*) as count FROM match_players WHERE match_id = (SELECT id FROM game_rooms WHERE room_code = $1)',
        [roomCode]
      );
      console.log('[Socket] start_round player count:', playerCountResult.rows[0].count);

      if (parseInt(playerCountResult.rows[0].count) < 2) {
        return callback({ success: false, error: 'Room needs 2 players to start' });
      }

      // Get room id and player map for this room
      const playersResult = await pool.query(
        `SELECT mp.player_number, u.id as user_id, u.username, gr.id as room_id
         FROM match_players mp
         JOIN users u ON mp.user_id = u.id
         JOIN game_rooms gr ON mp.match_id = gr.id
         WHERE gr.room_code = $1
         ORDER BY mp.player_number`,
        [roomCode]
      );

      const players = playersResult.rows;
      const roomId = players.length > 0 ? players[0].room_id : null;
      const playerMap = {};
      players.forEach(p => {
        playerMap[p.player_number] = p.user_id;
      });

      // Get or initialize game state
      let game = activeGames.get(roomCode);
      if (!game) {
        // First round: initialize match state
        activeGames.set(roomCode, {
          roomId: roomId,
          roomCode: roomCode,
          roundCount: 0,
          scores: { 1: 0, 2: 0 },
          players: playerMap,
          taps: {},
          roundActive: false,
          greenShownAt: null,
          matchStarted: true,
          matchEnded: false,
          savedToDb: false,
          countdownInterval: null,
          greenTimeout: null,
          roundResultTimeout: null,
          roundId: Date.now() + Math.floor(Math.random() * 10000),
          winnerDeclared: false,
        });
        game = activeGames.get(roomCode);
      } else if (game.roomId === null && roomId) {
        // Update roomId if it wasn't set before
        game.roomId = roomId;
      }

      // Validate roundId if provided (prevents stale events from previous rounds)
      if (roundId !== undefined && game.roundId && roundId !== game.roundId) {
        return callback({ success: false, error: 'Stale round request' });
      }

      // Prevent starting a round if one is already active
      if (game.roundActive) {
        return callback({ success: false, error: 'Round already in progress' });
      }

      // Clear any leftover timers from previous round
      if (game.countdownInterval) {
        clearInterval(game.countdownInterval);
        game.countdownInterval = null;
      }
      if (game.greenTimeout) {
        clearTimeout(game.greenTimeout);
        game.greenTimeout = null;
      }
      if (game.roundResultTimeout) {
        clearTimeout(game.roundResultTimeout);
        game.roundResultTimeout = null;
      }

      // Reset match-end flags for new game
      game.matchEnded = false;
      game.savedToDb = false;
      game.winnerDeclared = false;

      // Increment round count
      game.roundCount += 1;
      game.roundActive = true;
      game.taps = {};
      game.greenShownAt = null;

      console.log('[Socket] Round', game.roundCount, 'starting for room:', roomCode);

      // Tell both clients to show red waiting screen with round number
      io.to(roomCode).emit('round_started', {
        roomCode,
        roundNumber: game.roundCount,
        totalRounds: 5,
        scores: game.scores,
        roundId: game.roundId,
      });

      // Generate random delay between 2 and 5 seconds
      const delayMs = 2000 + Math.floor(Math.random() * 3001);
      console.log('[Socket] Round', game.roundCount, 'random delay:', delayMs, 'ms');

      // After random delay, show GREEN
      game.greenTimeout = setTimeout(() => {
        const g = activeGames.get(roomCode);
        if (!g || !g.roundActive) return;
        g.greenShownAt = Date.now();
        io.to(roomCode).emit('show_green', { roomCode, greenTime: g.greenShownAt, roundNumber: g.roundCount });
        console.log('[Socket] Round', g.roundCount, 'GREEN emitted for room:', roomCode);

        // 10-second tap window after green
        let tapCountdown = 10;
        g.countdownInterval = setInterval(() => {
          const gg = activeGames.get(roomCode);
          if (!gg || !gg.roundActive) {
            clearInterval(gg.countdownInterval);
            gg.countdownInterval = null;
            return;
          }
          io.to(roomCode).emit('countdown_tick', { roomCode, countdown: tapCountdown, roundNumber: gg.roundCount });
          tapCountdown--;
          if (tapCountdown < 0) {
            clearInterval(gg.countdownInterval);
            gg.countdownInterval = null;
            // No taps within 10 seconds - round is draw
            determineRoundWinner(gg, roomCode, io, pool);
          }
        }, 1000);
      }, delayMs);

      callback({ success: true });
      console.log('[Socket] Round', game.roundCount, 'started for room:', roomCode);
    } catch (err) {
      console.error('[Socket] Start round error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  // Determine round winner and advance to next round or end match
  async function determineRoundWinner(game, roomCode, io, pool) {
    if (!game.roundActive || game.winnerDeclared) return;
    game.winnerDeclared = true;
    game.roundActive = false;

    // Clear all pending timers
    if (game.countdownInterval) {
      clearInterval(game.countdownInterval);
      game.countdownInterval = null;
    }
    if (game.greenTimeout) {
      clearTimeout(game.greenTimeout);
      game.greenTimeout = null;
    }
    if (game.roundResultTimeout) {
      clearTimeout(game.roundResultTimeout);
      game.roundResultTimeout = null;
    }

    const taps = Object.values(game.taps);
    let winner = null;

    if (taps.length > 0) {
      // First tap (lowest reaction time) wins
      const sorted = taps.sort((a, b) => a.reactionTime - b.reactionTime);
      winner = sorted[0];
      game.scores[winner.playerNumber] += 1;
    }

    // Emit round result to both players
    io.to(roomCode).emit('round_result', {
      roomCode,
      roundNumber: game.roundCount,
      totalRounds: 5,
      winner: winner ? winner.playerNumber : null,
      reactionTimes: {
        1: game.taps[1]?.reactionTime || null,
        2: game.taps[2]?.reactionTime || null,
      },
      scores: { ...game.scores },
      message: winner ? `Player ${winner.playerNumber} wins the round!` : "Round draw - no one tapped!",
    });

    console.log('[Socket] Round', game.roundCount, 'result:', winner ? `P${winner.playerNumber} wins` : 'draw', 'scores:', JSON.stringify(game.scores));

    // Check if match is over (5 rounds)
    if (game.roundCount >= 5) {
      game.matchEnded = true;
    } else {
      // Auto-start next round after 3 seconds (server-driven only, no client action needed)
      game.roundResultTimeout = setTimeout(async () => {
        const g = activeGames.get(roomCode);
        if (!g || g.matchEnded) return;

        // Increment round count
        g.roundCount += 1;
        g.roundActive = true;
        g.taps = {};
        g.greenShownAt = null;
        g.winnerDeclared = false;

        console.log('[Socket] Round', g.roundCount, 'auto-starting for room:', roomCode);

        // Tell both clients to show red waiting screen with round number
        io.to(roomCode).emit('round_started', {
          roomCode,
          roundNumber: g.roundCount,
          totalRounds: 5,
          scores: g.scores,
          roundId: g.roundId,
        });

        // Generate random delay between 2 and 5 seconds
        const delayMs = 2000 + Math.floor(Math.random() * 3001);
        console.log('[Socket] Round', g.roundCount, 'random delay:', delayMs, 'ms');

        // After random delay, show GREEN
        g.greenTimeout = setTimeout(() => {
          const gg = activeGames.get(roomCode);
          if (!gg || !gg.roundActive) return;
          gg.greenShownAt = Date.now();
          io.to(roomCode).emit('show_green', { roomCode, greenTime: gg.greenShownAt, roundNumber: gg.roundCount, roundId: gg.roundId });
          console.log('[Socket] Round', gg.roundCount, 'GREEN emitted for room:', roomCode);

          // 10-second tap window after green
          let tapCountdown = 10;
          gg.countdownInterval = setInterval(() => {
            const g4 = activeGames.get(roomCode);
            if (!g4 || !g4.roundActive) {
              clearInterval(g4.countdownInterval);
              g4.countdownInterval = null;
              return;
            }
            io.to(roomCode).emit('countdown_tick', { roomCode, countdown: tapCountdown, roundNumber: g4.roundCount });
            tapCountdown--;
            if (tapCountdown < 0) {
              clearInterval(g4.countdownInterval);
              g4.countdownInterval = null;
              // No taps within 10 seconds - round is draw
              determineRoundWinner(g4, roomCode, io, pool);
            }
          }, 1000);
        }, delayMs);
      }, 3000);
    }
  }

  // Player taps their zone
  socket.on('player_tap', async (data, callback) => {
    try {
      const { roomCode, userId, playerNumber } = data;
      const game = activeGames.get(roomCode);

      if (!game || !game.roundActive || !game.greenShownAt) {
        return callback({ success: false, error: 'Game not active or green not shown yet' });
      }

      const tapTime = Date.now();

      // False start check: tapped before green
      if (tapTime < game.greenShownAt) {
        return callback({
          success: false,
          error: 'False start! You tapped before the green signal.',
          reactionTime: tapTime - game.greenShownAt, // negative value
        });
      }

      // Record first tap only per player
      if (!game.taps[playerNumber]) {
        game.taps[playerNumber] = {
          userId,
          playerNumber,
          tapTime,
          reactionTime: tapTime - game.greenShownAt,
        };

        // Immediate round end on first valid tap
        const g = activeGames.get(roomCode);
        if (g && g.roundActive) {
          determineRoundWinner(g, roomCode, io, pool);
        }
      }

      callback({ success: true, reactionTime: game.taps[playerNumber].reactionTime });
    } catch (err) {
      console.error('[Socket] Player tap error:', err.message);
      callback({ success: false, error: err.message });
    }
  });

  // Player sends an emote to opponent in the same room
  socket.on('player_emote', (data, callback) => {
    try {
      const { roomCode, userId, playerNumber, emoji } = data;
      if (!roomCode || !emoji) {
        return callback && callback({ success: false, error: 'Missing data' });
      }
      // Broadcast to everyone in the room except the sender (sender already shows locally)
      socket.to(roomCode).emit('emote_received', { userId, playerNumber, emoji });
      callback && callback({ success: true });
    } catch (err) {
      console.error('[Socket] Player emote error:', err.message);
      callback && callback({ success: false, error: err.message });
    }
  });

  // Game ended by one player (surrender/end game) - notify both players
  socket.on('game_ended', async (data, callback) => {
    try {
      const { roomCode, userId, reason } = data;
      const game = activeGames.get(roomCode);
      console.log('[Socket] game_ended:', { roomCode, userId, reason });

      // Determine winner based on scores (higher score wins)
      // Surrender does NOT automatically make the opponent win
      let winner = null;
      if (game && game.scores) {
        if (game.scores[1] > game.scores[2]) {
          winner = game.players[1];
        } else if (game.scores[2] > game.scores[1]) {
          winner = game.players[2];
        } else {
          winner = null; // Draw
        }
      }

      // Log match state for debugging
      console.log('[Socket] Match state:', {
        player1: game?.players[1],
        player2: game?.players[2],
        player1Score: game?.scores[1],
        player2Score: game?.scores[2],
        winnerId: winner,
        reason
      });

      // Save match result to database before emitting
      if (game && game.roomId) {
        try {
          const matchResult = await pool.query(
            'INSERT INTO matches (room_id, winner_id, p1_score, p2_score) VALUES ($1, $2, $3, $4) RETURNING id',
            [game.roomId, winner, game.scores[1], game.scores[2]]
          );
          const matchId = matchResult.rows[0].id;

          // Update each player's match record (rows already exist from create/join room)
          for (let playerNum = 1; playerNum <= 2; playerNum++) {
            const playerId = game.players[playerNum];
            if (!playerId) continue;
            await pool.query(
              'UPDATE match_players SET score = $1, best_reaction_time = $2 WHERE match_id = $3 AND user_id = $4 AND player_number = $5',
              [game.scores[playerNum] || 0, game.taps[playerNum]?.reactionTime || null, game.roomId, playerId, playerNum]
            );
          }
          console.log('[DB] Match saved (surrender/end_game): id=', matchId, 'winner=', winner, 'scores:', JSON.stringify(game.scores));
        } catch (dbErr) {
          console.error('[DB] Error saving match during game_ended:', dbErr.message);
        }
      }

      // Look up player names for display
      let player1Name = 'Player 1';
      let player2Name = 'Player 2';
      let winnerName = null;
      let loserName = null;

      if (game && game.players) {
        try {
          const playerIds = [game.players[1], game.players[2]].filter(Boolean);
          if (playerIds.length > 0) {
            const nameResult = await pool.query(
              'SELECT id, username FROM users WHERE id = ANY($1)',
              [playerIds]
            );
            const nameMap = {};
            nameResult.rows.forEach(row => {
              nameMap[row.id] = row.username;
            });
            player1Name = nameMap[game.players[1]] || 'Player 1';
            player2Name = nameMap[game.players[2]] || 'Player 2';
            if (winner && nameMap[winner]) {
              winnerName = nameMap[winner];
            }
            const loserId = winner === game.players[1] ? game.players[2] : winner === game.players[2] ? game.players[1] : null;
            if (loserId && nameMap[loserId]) {
              loserName = nameMap[loserId];
            }
          }
        } catch (err) {
          console.error('[Socket] Error looking up player names:', err.message);
        }
      }

      // Broadcast to all players in the room
      io.to(roomCode).emit('game_ended', {
        roomCode,
        userId,
        winner,
        player1Id: game.players[1],
        player2Id: game.players[2],
        winnerName,
        loserName,
        player1Name,
        player2Name,
        scores: { 1: game.scores[1] || 0, 2: game.scores[2] || 0 },
        reason
      });

      // Mark match as ended in server game state
      if (game) {
        game.matchEnded = true;
      }

      if (typeof callback === 'function') {
        callback({ success: true });
      }
    } catch (err) {
      console.error('[Socket] Game ended error:', err.message);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Reset game state for a room (Play Again) - server-authoritative reset with rematch coordination
  socket.on('reset_game', async (data, callback) => {
    try {
      const { roomCode, userId } = data;
      console.log('[REMATCH] reset_game received:', { roomCode, userId, socketId: socket.id });

      // Track rematch request for this user (store as string for safe comparison)
      const userIdStr = String(userId);
      if (!rematchRequests.has(roomCode)) {
        rematchRequests.set(roomCode, new Set());
      }
      rematchRequests.get(roomCode).add(userIdStr);

      // Debug: log current rematch state
      const reqSet = rematchRequests.get(roomCode);
      console.log('[REMATCH] Current requests for room', roomCode, ':', Array.from(reqSet));

      // Get both player IDs in this room from the database
      const playersResult = await pool.query(
        `SELECT mp.user_id, mp.player_number, u.username
         FROM match_players mp
         JOIN game_rooms gr ON mp.match_id = gr.id
         JOIN users u ON mp.user_id = u.id
         WHERE gr.room_code = $1
         ORDER BY mp.player_number`,
        [roomCode]
      );
      const dbPlayerIds = playersResult.rows.map(r => String(r.user_id));
      const dbPlayers = playersResult.rows.map(r => ({ id: String(r.user_id), number: r.player_number, username: r.username }));

      console.log('[REMATCH] DB players for room', roomCode, ':', dbPlayers);

      // Check if ALL players in the room have requested a rematch
      const allRequested = dbPlayerIds.length > 0 && dbPlayerIds.every(id => reqSet.has(id));

      console.log('[REMATCH] All requested:', allRequested, '| dbPlayerIds:', dbPlayerIds, '| reqSet has all:', dbPlayerIds.every(id => reqSet.has(id)));

      if (allRequested) {
        // Both agreed — clear rematch requests and start a new match
        rematchRequests.delete(roomCode);
        console.log('[REMATCH] Both players agreed. Starting new match for room:', roomCode);

        const game = activeGames.get(roomCode);
        if (game) {
          // Clear all pending timers
          if (game.countdownInterval) {
            clearInterval(game.countdownInterval);
            game.countdownInterval = null;
          }
          if (game.greenTimeout) {
            clearTimeout(game.greenTimeout);
            game.greenTimeout = null;
          }
          if (game.roundResultTimeout) {
            clearTimeout(game.roundResultTimeout);
            game.roundResultTimeout = null;
          }

          // Fully reset game state for a fresh 5-round match
          game.roundActive = false;
          game.matchStarted = false;
          game.matchEnded = false;
          game.savedToDb = false;
          game.roundCount = 0;
          game.scores = { 1: 0, 2: 0 };
          game.taps = {};
          game.greenShownAt = null;
          game.winnerDeclared = false;
          game.roundId = Date.now() + Math.floor(Math.random() * 10000);
        } else {
          // Initialize fresh game state if none exists (e.g., after server restart)
          activeGames.set(roomCode, {
            roomId: null,
            roomCode: roomCode,
            roundCount: 0,
            scores: { 1: 0, 2: 0 },
            players: {},
            taps: {},
            roundActive: false,
            greenShownAt: null,
            matchStarted: false,
            matchEnded: false,
            savedToDb: false,
            countdownInterval: null,
            greenTimeout: null,
            roundResultTimeout: null,
            roundId: Date.now() + Math.floor(Math.random() * 10000),
            winnerDeclared: false,
          });
        }

        const currentGame = activeGames.get(roomCode);
        const roundId = currentGame ? currentGame.roundId : Date.now();

        // Notify both clients that a rematch has started FIRST (updates client roundId before round_started)
        io.to(roomCode).emit('rematch_started', {
          roomCode,
          roundId,
          resetBy: userIdStr,
          timestamp: Date.now(),
        });

        console.log('[REMATCH] rematch_started emitted to room:', roomCode);

        // Start the first round of the new match automatically (after rematch_started so client roundId is updated)
        if (currentGame) {
          currentGame.roundCount = 1;
          currentGame.roundActive = true;
          currentGame.taps = {};
          currentGame.greenShownAt = null;

          io.to(roomCode).emit('round_started', {
            roomCode,
            roundNumber: currentGame.roundCount,
            totalRounds: 5,
            scores: currentGame.scores,
            roundId: currentGame.roundId,
          });

          console.log('[REMATCH] round_started emitted to room:', roomCode, 'round:', currentGame.roundCount);

          const delayMs = 2000 + Math.floor(Math.random() * 3001);
          currentGame.greenTimeout = setTimeout(() => {
            const g = activeGames.get(roomCode);
            if (!g || !g.roundActive) return;
            g.greenShownAt = Date.now();
            io.to(roomCode).emit('show_green', { roomCode, greenTime: g.greenShownAt, roundNumber: g.roundCount });

            let tapCountdown = 10;
            g.countdownInterval = setInterval(() => {
              const gg = activeGames.get(roomCode);
              if (!gg || !gg.roundActive) {
                clearInterval(gg.countdownInterval);
                gg.countdownInterval = null;
                return;
              }
              io.to(roomCode).emit('countdown_tick', { roomCode, countdown: tapCountdown, roundNumber: gg.roundCount });
              tapCountdown--;
              if (tapCountdown < 0) {
                clearInterval(gg.countdownInterval);
                gg.countdownInterval = null;
                determineRoundWinner(gg, roomCode, io, pool);
              }
            }, 1000);
          }, delayMs);
        }

        if (typeof callback === 'function') {
          callback({ success: true, rematch: true });
        }
      } else {
        // Waiting for the opponent to click Play Again
        console.log('[REMATCH] Waiting for opponent. Requests:', Array.from(reqSet), '| DB players:', dbPlayerIds);
        if (typeof callback === 'function') {
          callback({ success: true, waiting: true, message: 'Waiting for opponent to click Play Again...' });
        }
      }
    } catch (err) {
      console.error('[Socket] Reset game error:', err.message);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Cancel a pending rematch request (e.g. player navigates away from gameover)
  socket.on('cancel_rematch', (data, callback) => {
    try {
      const { roomCode, userId } = data;
      const userIdStr = String(userId);
      if (roomCode && rematchRequests.has(roomCode)) {
        rematchRequests.get(roomCode).delete(userIdStr);
        if (rematchRequests.get(roomCode).size === 0) {
          rematchRequests.delete(roomCode);
        }
      }
      callback && callback({ success: true });
    } catch (err) {
      console.error('[Socket] Cancel rematch error:', err.message);
      callback && callback({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
    if (socket.data.roomCode) {
      socket.to(socket.data.roomCode).emit('player_disconnected', { userId: socket.data.userId });
      // Clean up rematch request for the disconnected user
      if (rematchRequests.has(socket.data.roomCode)) {
        rematchRequests.get(socket.data.roomCode).delete(String(socket.data.userId));
        if (rematchRequests.get(socket.data.roomCode).size === 0) {
          rematchRequests.delete(socket.data.roomCode);
        }
      }
    }
  });
});

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
