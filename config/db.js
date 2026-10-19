// ==========================================================
// MySQL connection settings
// Edit the values below to match your local MySQL setup.
// The database (schema) must already exist — run hostel_dbms.sql
// in MySQL first if you haven't already.
// ==========================================================

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",       // usually "localhost" or "127.0.0.1"
  user: "root",            // your MySQL username
  password: "saijaideep@2007", // your MySQL password
  database: "hostel_dbms", // database created by hostel_dbms.sql
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();


