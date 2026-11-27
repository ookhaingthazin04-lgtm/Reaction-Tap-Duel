const fs = require('fs');
const path = require('path');
const pool = require('./config');

async function createDatabase() {
  // Connect to the default 'postgres' database to create our database
  const adminPool = new (require('pg').Pool)({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: 'postgres',
  });

  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.PG_DATABASE || 'reaction_tap_duel']
    );

    if (result.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${process.env.PG_DATABASE || 'reaction_tap_duel'}"`);
      console.log(`[Setup] Database '${process.env.PG_DATABASE || 'reaction_tap_duel'}' created successfully`);
    } else {
      console.log(`[Setup] Database '${process.env.PG_DATABASE || 'reaction_tap_duel'}' already exists`);
    }
  } catch (err) {
    console.error('[Setup] Error creating database:', err.message);
    throw err;
  } finally {
    await adminPool.end();
  }
}

async function createTables() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Remove the CREATE DATABASE line if present (we handle that separately)
  const cleanSql = sql.replace(/-- Step 1:.*\n-- CREATE DATABASE.*\n/g, '');

  try {
    await pool.query(cleanSql);
    console.log('[Setup] All tables created successfully');
  } catch (err) {
    console.error('[Setup] Error creating tables:', err.message);
    throw err;
  }
}

async function main() {
  try {
    await createDatabase();
    await createTables();
    console.log('[Setup] Database setup complete!');
  } catch (err) {
    console.error('[Setup] Setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();