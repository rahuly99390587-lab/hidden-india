// One-off script to create the first admin login.
// Usage: node src/seed.js admin@hiddenindia.in "a-strong-password"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

(async () => {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node src/seed.js <email> <password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  try {
    await pool.query(
      `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email.toLowerCase().trim(), hash]
    );
    console.log(`✓ Admin user ready: ${email}`);
  } catch (err) {
    console.error('✗ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
