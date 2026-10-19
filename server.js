const express = require("express");
const path = require("path");
const db = require("./config/db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// Table definitions — one entry per table in hostel_dbms.sql.
// This is the single source of truth: the frontend fetches
// this via GET /api/schema and builds forms/tables from it.
// ==========================================================
const TABLES = {
  staff: {
    label: "Staff",
    table: "Staff",
    pk: "staff_id",
    columns: [
      { name: "staff_name", label: "Staff Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
    ],
  },
  hostel_block: {
    label: "Hostel Block",
    table: "Hostel_Block",
    pk: "block_id",
    columns: [
      { name: "block_name", label: "Block Name", type: "text", required: true },
      { name: "warden_id", label: "Warden", type: "fk", refTable: "staff", refLabel: "staff_name" },
      { name: "total_capacity", label: "Total Capacity", type: "number" },
    ],
  },
  room: {
    label: "Room",
    table: "Room",
    pk: "room_id",
    columns: [
      { name: "room_no", label: "Room No.", type: "text", required: true },
      { name: "capacity", label: "Capacity", type: "number", required: true },
      { name: "block_id", label: "Block", type: "fk", refTable: "hostel_block", refLabel: "block_name" },
      { name: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Maintenance"] },
    ],
  },
  student: {
    label: "Student",
    table: "Student",
    pk: "student_id",
    columns: [
      { name: "student_name", label: "Student Name", type: "text", required: true },
      { name: "gender", label: "Gender", type: "select", options: ["M", "F", "Other"] },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "room_id", label: "Room", type: "fk", refTable: "room", refLabel: "room_no" },
    ],
  },
  fee_payment: {
    label: "Fee Payment",
    table: "Fee_Payment",
    pk: "payment_id",
    columns: [
      { name: "student_id", label: "Student", type: "fk", refTable: "student", refLabel: "student_name", required: true },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "due_date", label: "Due Date", type: "date" },
      { name: "paid_date", label: "Paid Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Paid", "Pending", "Overdue"] },
    ],
  },
  complaint: {
    label: "Complaint",
    table: "Complaint",
    pk: "complaint_id",
    columns: [
      { name: "student_id", label: "Student", type: "fk", refTable: "student", refLabel: "student_name", required: true },
      { name: "complaint_type", label: "Type", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Pending", "In Progress", "Resolved"] },
      { name: "date_raised", label: "Date Raised", type: "date" },
    ],
  },
  mess: {
    label: "Mess",
    table: "Mess",
    pk: "mess_id",
    columns: [
      { name: "student_id", label: "Student", type: "fk", refTable: "student", refLabel: "student_name", required: true },
      { name: "meal_plan", label: "Meal Plan", type: "select", options: ["Veg", "Non-Veg"] },
      { name: "month", label: "Month (YYYY-MM)", type: "text" },
      { name: "monthly_charge", label: "Monthly Charge", type: "number" },
    ],
  },
  visitor: {
    label: "Visitor",
    table: "Visitor",
    pk: "visitor_id",
    columns: [
      { name: "student_id", label: "Student", type: "fk", refTable: "student", refLabel: "student_name", required: true },
      { name: "visitor_name", label: "Visitor Name", type: "text", required: true },
      { name: "purpose", label: "Purpose", type: "text" },
      { name: "entry_time", label: "Entry Time", type: "datetime-local" },
      { name: "exit_time", label: "Exit Time", type: "datetime-local" },
    ],
  },
};

function getConfigOr404(key, res) {
  const cfg = TABLES[key];
  if (!cfg) {
    res.status(404).json({ error: `Unknown table "${key}"` });
    return null;
  }
  return cfg;
}

// ---- schema (frontend uses this to build forms/tables) ----
app.get("/api/schema", (req, res) => {
  res.json(TABLES);
});

// ---- view all rows for a table ----
app.get("/api/:key", async (req, res) => {
  const cfg = getConfigOr404(req.params.key, res);
  if (!cfg) return;
  try {
    const [rows] = await db.query(`SELECT * FROM \`${cfg.table}\` ORDER BY \`${cfg.pk}\` DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- insert a row ----
app.post("/api/:key", async (req, res) => {
  const cfg = getConfigOr404(req.params.key, res);
  if (!cfg) return;

  const colNames = cfg.columns.map((c) => c.name);
  const values = cfg.columns.map((col) => {
    let v = req.body[col.name];
    if (v === undefined || v === "") return null;
    // <input type="datetime-local"> gives "YYYY-MM-DDTHH:MM"; MySQL DATETIME wants a space.
    if (col.type === "datetime-local") v = v.replace("T", " ");
    return v;
  });

  const missing = cfg.columns.filter((c) => c.required && (req.body[c.name] === undefined || req.body[c.name] === ""));
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.map((c) => c.label).join(", ")}` });
  }

  const placeholders = colNames.map(() => "?").join(", ");
  const columnList = colNames.map((n) => `\`${n}\``).join(", ");

  try {
    const [result] = await db.query(
      `INSERT INTO \`${cfg.table}\` (${columnList}) VALUES (${placeholders})`,
      values
    );
    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- delete a row by primary key ----
app.delete("/api/:key/:id", async (req, res) => {
  const cfg = getConfigOr404(req.params.key, res);
  if (!cfg) return;
  try {
    const [result] = await db.query(`DELETE FROM \`${cfg.table}\` WHERE \`${cfg.pk}\` = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Hostel DBMS UI running at http://localhost:${PORT}`);
});
