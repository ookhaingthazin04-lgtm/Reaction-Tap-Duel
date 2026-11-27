-- Reaction Tap Duel Database Backup
-- Generated: 2026-11-17T06:45:38.808Z

-- Table: users (3 rows)
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

INSERT INTO users (id, username, email, password_hash, created_at) VALUES (1, 'testuser1794895275411', 'test1794895275411@example.com', '$2b$10$FW7Kb54wAxI8hnE/vfR3HeyBk8RFu1vkbqFv3vQhTJbeznwUxFr96', '2026-11-17T06:01:15.862Z');
INSERT INTO users (id, username, email, password_hash, created_at) VALUES (2, 'Thet Htoo', 'ths28112003@gmail.com', '$2b$10$yKsBnroROdsMmzJMYOMG6OAUfEw9ijcfDLXRHo5dMpTlttlO7Agym', '2026-11-17T06:26:17.077Z');
INSERT INTO users (id, username, email, password_hash, created_at) VALUES (3, 'Myatnoe', 'hiroshii2004@gmail.com', '$2b$10$NHYAU07tGHCS8ZClPiGbXOSGLWKV1XCtI.YHiYBHGvCPpqOTPOsL2', '2026-11-17T06:27:24.204Z');

-- Table: game_rooms (2 rows)
TRUNCATE TABLE game_rooms RESTART IDENTITY CASCADE;

INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (1, 'X4REZS', 'active', '2026-11-17T06:26:27.340Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (2, '465PQJ', 'active', '2026-11-17T06:38:07.110Z');

-- Table: matches (2 rows)
TRUNCATE TABLE matches RESTART IDENTITY CASCADE;

INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (1, 1, NULL, 2, 3, '2026-11-17T06:28:12.712Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (2, 2, 2, 3, 2, '2026-11-17T06:39:36.689Z');

-- Table: match_players (5 rows)
TRUNCATE TABLE match_players RESTART IDENTITY CASCADE;

INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (2, 1, 3, 2, 0, NULL, true, '2026-11-17T06:27:30.231Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (1, 1, 2, 1, 0, NULL, true, '2026-11-17T06:26:27.388Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (3, 1, 2, 2, 1, 1618, false, '2026-11-17T06:28:12.738Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (5, 2, 3, 2, 0, NULL, true, '2026-11-17T06:38:52.652Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (4, 2, 2, 1, 1, 1272, true, '2026-11-17T06:38:07.136Z');

