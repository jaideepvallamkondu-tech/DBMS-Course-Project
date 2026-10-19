// Quick standalone check: is config/db.js actually able to reach MySQL?
// Run with:  node test-db.js

const db = require("./config/db");
(async () => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS db, NOW() AS server_time");
    console.log("✅ Connected successfully!");
    console.log("   Connected to database:", rows[0].db);
    console.log("   MySQL server time:    ", rows[0].server_time);

    const [tables] = await db.query("SHOW TABLES");
    console.log(`   Found ${tables.length} table(s):`, tables.map((t) => Object.values(t)[0]).join(", "));
  } catch (err) {
    console.log("❌ Connection failed:");
    console.log("   ", err.message);
  } finally {
    process.exit();
  }
})();