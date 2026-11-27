const pool = require('./config');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time, VERSION() AS version');
    console.log('[Test] Database connection successful!');
    console.log('[Test] Server time:', result.rows[0].current_time);
    console.log('[Test] PostgreSQL version:', result.rows[0].version);

    // Check that our tables exist
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n[Test] Tables in database:');
    if (tables.rows.length === 0) {
      console.log('  (no tables found - run node db/setup.js first)');
    } else {
      tables.rows.forEach((row) => console.log(`  - ${row.table_name}`));
    }
  } catch (err) {
    console.error('[Test] Database connection failed:', err.message);
    console.error('\n[Troubleshooting]');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file has correct host, port, user, and password');
    console.error('3. Make sure the database reaction_tap_duel exists');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();