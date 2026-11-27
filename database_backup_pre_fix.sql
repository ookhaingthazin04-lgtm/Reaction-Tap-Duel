-- Reaction Tap Duel Database Backup (Pre-Fix)
-- Generated: 2026-11-17T09:41:53.964Z

-- Table: users (4 rows)
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

INSERT INTO users (id, username, email, password_hash, created_at) VALUES (1, 'testuser1794895275411', 'test1794895275411@example.com', '$2b$10$FW7Kb54wAxI8hnE/vfR3HeyBk8RFu1vkbqFv3vQhTJbeznwUxFr96', '2026-11-17T06:01:15.862Z');
INSERT INTO users (id, username, email, password_hash, created_at) VALUES (2, 'Thet Htoo', 'ths28112003@gmail.com', '$2b$10$yKsBnroROdsMmzJMYOMG6OAUfEw9ijcfDLXRHo5dMpTlttlO7Agym', '2026-11-17T06:26:17.077Z');
INSERT INTO users (id, username, email, password_hash, created_at) VALUES (3, 'Myatnoe', 'hiroshii2004@gmail.com', '$2b$10$NHYAU07tGHCS8ZClPiGbXOSGLWKV1XCtI.YHiYBHGvCPpqOTPOsL2', '2026-11-17T06:27:24.204Z');
INSERT INTO users (id, username, email, password_hash, created_at) VALUES (4, 'Htun Htun', 'htun1234@gmail.com', '$2b$10$0TO.N8kGOiCrbCZbQ9XC7OrxVqcS/y7QhmGhGICwMq0ku3rg0hl4G', '2026-11-17T08:31:28.883Z');

-- Table: game_rooms (21 rows)
TRUNCATE TABLE game_rooms RESTART IDENTITY CASCADE;

INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (1, 'X4REZS', 'active', '2026-11-17T06:26:27.340Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (2, '465PQJ', 'active', '2026-11-17T06:38:07.110Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (3, 'Q5AHHZ', 'waiting', '2026-11-17T06:51:22.528Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (4, 'R7ZBFH', 'active', '2026-11-17T06:51:39.321Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (5, 'HNWHC9', 'active', '2026-11-17T07:24:57.970Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (6, '7LNJGM', 'active', '2026-11-17T07:41:51.972Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (7, '44Q49U', 'active', '2026-11-17T08:02:47.170Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (8, 'ZZ9G2C', 'active', '2026-11-17T08:13:27.640Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (9, 'ADQN5Q', 'active', '2026-11-17T08:26:49.168Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (10, 'QL7NLQ', 'waiting', '2026-11-17T08:31:34.345Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (11, 'GHNYLH', 'active', '2026-11-17T08:32:13.785Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (12, '9BAUR5', 'waiting', '2026-11-17T08:34:57.617Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (13, '6KFAYG', 'active', '2026-11-17T08:47:56.940Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (14, 'G9CZCW', 'active', '2026-11-17T09:07:40.416Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (15, '56DYAR', 'active', '2026-11-17T09:16:31.871Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (16, 'F2RHT4', 'waiting', '2026-11-17T09:18:02.858Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (17, 'HGUNZ7', 'waiting', '2026-11-17T09:19:19.700Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (18, 'XU23VR', 'waiting', '2026-11-17T09:20:29.103Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (19, '8EEHCG', 'waiting', '2026-11-17T09:21:00.834Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (20, 'CSAECK', 'active', '2026-11-17T09:28:28.052Z');
INSERT INTO game_rooms (id, room_code, status, created_at) VALUES (21, 'G45FCJ', 'active', '2026-11-17T09:37:19.507Z');

-- Table: matches (12 rows)
TRUNCATE TABLE matches RESTART IDENTITY CASCADE;

INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (1, 1, NULL, 2, 3, '2026-11-17T06:28:12.712Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (2, 2, 2, 3, 2, '2026-11-17T06:39:36.689Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (3, 4, 2, 3, 2, '2026-11-17T06:52:52.117Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (4, 5, 2, 4, 1, '2026-11-17T07:26:11.728Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (5, 6, 3, 2, 3, '2026-11-17T07:43:44.975Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (6, 7, 3, 2, 3, '2026-11-17T08:04:11.641Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (7, 8, 2, 3, 2, '2026-11-17T08:15:00.766Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (8, NULL, NULL, 4, 1, '2026-11-17T08:28:22.762Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (9, NULL, NULL, 3, 2, '2026-11-17T08:33:38.856Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (10, NULL, NULL, 2, 3, '2026-11-17T08:48:49.644Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (11, NULL, NULL, 3, 2, '2026-11-17T09:09:12.061Z');
INSERT INTO matches (id, room_id, winner_id, p1_score, p2_score, created_at) VALUES (12, 21, 3, 1, 4, '2026-11-17T09:38:25.174Z');

-- Table: match_players (36 rows)
TRUNCATE TABLE match_players RESTART IDENTITY CASCADE;

INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (2, 1, 3, 2, 0, NULL, true, '2026-11-17T06:27:30.231Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (1, 1, 2, 1, 0, NULL, true, '2026-11-17T06:26:27.388Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (3, 1, 2, 2, 1, 1618, false, '2026-11-17T06:28:12.738Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (5, 2, 3, 2, 0, NULL, true, '2026-11-17T06:38:52.652Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (4, 2, 2, 1, 1, 1272, true, '2026-11-17T06:38:07.136Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (6, 3, 2, 1, 0, NULL, false, '2026-11-17T06:51:22.588Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (8, 4, 3, 2, 0, NULL, true, '2026-11-17T06:52:14.556Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (7, 4, 2, 1, 0, NULL, true, '2026-11-17T06:51:39.341Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (10, 5, 3, 2, 0, NULL, true, '2026-11-17T07:25:28.834Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (9, 5, 2, 1, 1, 529, true, '2026-11-17T07:24:57.999Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (12, 6, 3, 2, 0, NULL, true, '2026-11-17T07:42:59.386Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (11, 6, 2, 1, 1, 388, true, '2026-11-17T07:41:51.977Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (14, 7, 3, 2, 0, NULL, true, '2026-11-17T08:03:18.689Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (13, 7, 2, 1, 0, NULL, true, '2026-11-17T08:02:47.192Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (16, 8, 3, 2, 0, NULL, true, '2026-11-17T08:14:04.276Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (15, 8, 2, 1, 0, NULL, true, '2026-11-17T08:13:27.648Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (18, 9, 3, 2, 0, NULL, true, '2026-11-17T08:27:25.956Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (17, 9, 2, 1, 0, NULL, true, '2026-11-17T08:26:49.195Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (19, 10, 4, 1, 0, NULL, false, '2026-11-17T08:31:34.354Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (21, 11, 2, 2, 0, NULL, true, '2026-11-17T08:32:57.368Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (20, 11, 4, 1, 0, NULL, true, '2026-11-17T08:32:13.832Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (22, 12, 2, 1, 0, NULL, false, '2026-11-17T08:34:57.643Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (24, 13, 4, 2, 0, NULL, true, '2026-11-17T08:48:09.590Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (23, 13, 2, 1, 0, NULL, true, '2026-11-17T08:47:56.961Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (26, 14, 3, 2, 0, NULL, true, '2026-11-17T09:08:29.606Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (25, 14, 2, 1, 0, NULL, true, '2026-11-17T09:07:40.470Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (28, 15, 3, 2, 0, NULL, true, '2026-11-17T09:16:57.581Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (27, 15, 2, 1, 0, NULL, true, '2026-11-17T09:16:31.905Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (30, 17, 3, 1, 0, NULL, false, '2026-11-17T09:19:19.708Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (29, 16, 2, 1, 0, NULL, true, '2026-11-17T09:18:02.887Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (31, 18, 2, 1, 0, NULL, false, '2026-11-17T09:20:29.135Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (32, 19, 2, 1, 0, NULL, false, '2026-11-17T09:21:00.860Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (34, 20, 4, 2, 0, NULL, true, '2026-11-17T09:29:15.630Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (33, 20, 2, 1, 0, NULL, true, '2026-11-17T09:28:28.096Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (36, 21, 3, 2, 0, NULL, true, '2026-11-17T09:37:42.885Z');
INSERT INTO match_players (id, match_id, user_id, player_number, score, best_reaction_time, ready, joined_at) VALUES (35, 21, 2, 1, 0, NULL, true, '2026-11-17T09:37:19.530Z');

-- Table: user_settings (1 rows)
TRUNCATE TABLE user_settings RESTART IDENTITY CASCADE;

INSERT INTO user_settings (id, user_id, sound_enabled, volume, created_at, updated_at, music_enabled, music_volume) VALUES (1, 2, true, '0.60', '2026-11-17T07:41:45.315Z', '2026-11-17T07:41:48.705Z', true, '0.50');

