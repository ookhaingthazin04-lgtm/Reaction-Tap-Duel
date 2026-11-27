-- Reaction Tap Duel - Music Settings Migration
-- Adds music_enabled and music_volume columns to user_settings
-- Run this in pgAdmin 4 Query Tool or via psql against reaction_tap_duel database
-- Backward-compatible: uses ADD COLUMN IF NOT EXISTS

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS music_volume NUMERIC(3,2) DEFAULT 0.5;
