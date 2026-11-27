const express = require('express');
const pool = require('../db/config');

const router = express.Router();

// Get all available waiting rooms
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      `SELECT gr.id, gr.room_code, gr.status, gr.created_at,
              mp1.username as player1_name,
              mp2.username as player2_name
       FROM game_rooms gr
       LEFT JOIN match_players mp1 ON gr.id = mp1.match_id AND mp1.player_number = 1
       LEFT JOIN match_players mp2 ON gr.id = mp2.match_id AND mp2.player_number = 2
       WHERE gr.status = 'waiting'
       ORDER BY gr.created_at DESC`
    );

    res.json({ rooms: result.rows });
  } catch (err) {
    console.error('Get rooms error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room details by code
router.get('/:roomCode', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      `SELECT gr.id, gr.room_code, gr.status, gr.created_at,
              mp1.username as player1_name, mp1.user_id as player1_id,
              mp2.username as player2_name, mp2.user_id as player2_id
       FROM game_rooms gr
       LEFT JOIN match_players mp1 ON gr.id = mp1.match_id AND mp1.player_number = 1
       LEFT JOIN match_players mp2 ON gr.id = mp2.match_id AND mp2.player_number = 2
       WHERE gr.room_code = $1`,
      [req.params.roomCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room: result.rows[0] });
  } catch (err) {
    console.error('Get room error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's current rooms
router.get('/user/my-rooms', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      `SELECT gr.id, gr.room_code, gr.status, gr.created_at,
              mp.player_number,
              mp1.username as player1_name,
              mp2.username as player2_name
       FROM game_rooms gr
       JOIN match_players mp ON gr.id = mp.match_id AND mp.user_id = $1
       LEFT JOIN match_players mp1 ON gr.id = mp1.match_id AND mp1.player_number = 1
       LEFT JOIN match_players mp2 ON gr.id = mp2.match_id AND mp2.player_number = 2
       ORDER BY gr.created_at DESC`,
      [req.session.userId]
    );

    res.json({ rooms: result.rows });
  } catch (err) {
    console.error('Get my rooms error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;