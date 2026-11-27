-- Reaction Tap Duel - User Settings Migration
-- Adds user_settings table for sound preferences per user
-- Run this in pgAdmin 4 Query Tool or via psql against reaction_tap_duel database

-- Table: user_settings
-- Stores per-user sound and UI preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  volume NUMERIC(3,2) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
