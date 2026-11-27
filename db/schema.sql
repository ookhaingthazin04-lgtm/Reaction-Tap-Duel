-- Reaction Tap Duel - Database Schema
-- Run this in pgAdmin 4 Query Tool or via psql

-- Step 1: Create the database (run this separately if database doesn't exist yet)
-- CREATE DATABASE reaction_tap_duel;

-- Step 2: Connect to the reaction_tap_duel database, then run the tables below

-- Drop existing tables (reverse dependency order, with CASCADE to handle constraints)
DROP TABLE IF EXISTS match_players CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS game_rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table: users
-- Stores player accounts
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: game_rooms
-- Stores game room information (for multiplayer sessions)
CREATE TABLE game_rooms (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, finished
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: matches
-- Stores completed match records
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES game_rooms(id) ON DELETE CASCADE,
  winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  p1_score INTEGER DEFAULT 0,
  p2_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: match_players
-- Stores each player's participation in a match/game_room
CREATE TABLE match_players (
  id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  score INTEGER DEFAULT 0,
  best_reaction_time INTEGER, -- in milliseconds
  ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX idx_matches_room_id ON matches(room_id);
CREATE INDEX idx_matches_winner_id ON matches(winner_id);
CREATE INDEX idx_match_players_match_id ON match_players(match_id);
CREATE INDEX idx_match_players_user_id ON match_players(user_id);
CREATE INDEX idx_game_rooms_room_code ON game_rooms(room_code);