const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '111225',
  database: 'reaction_tap_duel',
});

async function backup() {
  const tables = ['users', 'game_rooms', 'matches', 'match_players'];
  let backupSql = '-- Reaction Tap Duel Database Backup\n-- Generated: ' + new Date().toISOString() + '\n\n';

  for (const table of tables) {
    try {
      const result = await pool.query('SELECT * FROM ' + table);
      backupSql += '-- Table: ' + table + ' (' + result.rows.length + ' rows)\n';
      backupSql += 'TRUNCATE TABLE ' + table + ' RESTART IDENTITY CASCADE;\n\n';

      for (const row of result.rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (val instanceof Date) return "'" + val.toISOString() + "'";
          if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
          return val;
        });
        backupSql += 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ');\n';
      }
      backupSql += '\n';
    } catch (err) {
      backupSql += '-- Error backing up ' + table + ': ' + err.message + '\n\n';
    }
  }

  fs.writeFileSync('database_backup.sql', backupSql);
  console.log('Backup written to database_backup.sql');
  console.log('Tables backed up:', tables.join(', '));
  await pool.end();
}

backup().catch(err => console.error('Backup failed:', err.message));
