<<<<<<< HEAD
# Hostel DBMS — Admin UI (Presentation-III)

A simple web app that connects to your `hostel_dbms` MySQL database and lets you
**Insert**, **View**, and **Delete** records for every table (Staff, Hostel_Block,
Room, Student, Fee_Payment, Complaint, Mess, Visitor) through a browser UI.

Built with **Node.js + Express** (backend) and plain **HTML/CSS/JS** (frontend) —
no build step, no framework to install on the frontend.

## 1. Prerequisites

- [Node.js](https://nodejs.org/) installed (v18 or later). Check with:
  ```
  node --version
  ```
- MySQL Server running locally, with the `hostel_dbms` database already created
  by running `hostel_dbms.sql` (the script from Presentation-II). If you haven't
  run it yet:
  ```
  mysql -u root -p < hostel_dbms.sql
  ```

## 2. Open this folder in VS Code

Unzip this project and open the `hostel-dbms-webapp` folder in VS Code
(`File > Open Folder...`).

## 3. Install dependencies

Open a terminal in VS Code (`` Terminal > New Terminal `` or `` Ctrl+` ``) and run:

```
npm install
```

This downloads Express and the MySQL driver (`mysql2`) into a `node_modules`
folder — it needs an internet connection the first time.

## 4. Configure your database credentials

Open `config/db.js` and edit these three lines to match your MySQL setup:

```js
host: "localhost",
user: "root",
password: "YOUR_PASSWORD_HERE",   // <-- put your real MySQL password here
database: "hostel_dbms",
```

## 5. Run the app

```
npm start
```

You should see:

```
Hostel DBMS UI running at http://localhost:3000
```

Open that link in your browser.

## 6. Using the UI

- Click a table name in the left sidebar (Student, Room, Fee_Payment, etc.).
- **Insert**: fill the form at the top and click "Insert ...". Dropdown fields
  for related records (e.g. choosing a Student for a Fee_Payment) are populated
  automatically from the database.
- **View**: the table below the form always shows the current rows for the
  selected table — refresh happens automatically after every insert/delete.
- **Delete**: click the "Delete" button on any row (you'll be asked to confirm).

For the live demo, insert a record, show it appear in the table below, then
delete it and show it disappear — that's the "before and after" the assignment
asks for. Take screenshots of each step for your Presentation-III submission.

## 7. Stopping the server

Press `Ctrl + C` in the terminal.

## Project structure

```
hostel-dbms-webapp/
├── server.js          # Express server + REST API (GET/POST/DELETE per table)
├── config/db.js        # MySQL connection settings — edit this
├── public/
│   ├── index.html       # page layout
│   ├── style.css        # styling
│   └── app.js            # frontend logic (builds forms/tables from schema)
├── package.json
└── README.md
```

## How it works (for your viva / Q&A)

- `server.js` defines a `TABLES` object describing each table's columns, types,
  and foreign-key references. This is the single source of truth.
- `GET /api/schema` sends that definition to the browser, which uses it to
  **dynamically build** the insert form and the results table — no page per
  table, no duplicated code.
- `GET /api/:table` runs `SELECT * FROM <table>`.
- `POST /api/:table` runs a parameterized `INSERT INTO <table> (...) VALUES (...)`
  — values are passed as query parameters (not string-concatenated), which
  protects against SQL injection.
- `DELETE /api/:table/:id` runs `DELETE FROM <table> WHERE <primary_key> = ?`.
- Foreign-key fields (e.g. Student on Fee_Payment) render as a dropdown
  populated by fetching the referenced table and showing its primary key plus
  a readable label.
=======
# DBMS-Course-Project
Implementing a Database Management System for Hostel Accommodation and Student Services management System
>>>>>>> ce0d0b9195bd5cb42d016d62bb3e2c9d77f4fdbd
