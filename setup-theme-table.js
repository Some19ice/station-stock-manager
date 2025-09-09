const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

async function setupThemeTable() {
  try {
    const postgres = require('postgres');
    const sql = postgres(databaseUrl, { prepare: false });

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create_theme_table.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    await sql.unsafe(sqlContent);

    console.log('✅ Theme settings table setup completed successfully!');

    // Verify the table exists
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'theme_settings'
    `;

    if (result.length > 0) {
      console.log('✅ theme_settings table exists');
    } else {
      console.log('❌ theme_settings table was not created');
    }

    await sql.end();

  } catch (error) {
    console.error('❌ Error setting up theme table:', error);
    process.exit(1);
  }
}

setupThemeTable();
