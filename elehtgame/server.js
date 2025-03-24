const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Enable CORS for development
app.use(cors());

// Use body-parser to handle JSON requests
app.use(bodyParser.json());

// Create a connection pool to your MySQL database
const pool = mysql.createPool({
  host: "localhost",
  user: "your_mysql_user",
  password: "your_mysql_password",
  database: "your_database_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET endpoint to retrieve all submissions (optional)
app.get("/submissions", (req, res) => {
  pool.query("SELECT * FROM game_submissions", (err, results) => {
    if (err) {
      console.error("Error retrieving submissions:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json(results);
  });
});

// POST endpoint to receive final submission details
app.post("/submit", (req, res) => {
  const { name, rollNo, year, department, timeTaken } = req.body;
  const sql = `
    INSERT INTO game_submissions (name, roll_no, year, department, time_taken)
    VALUES (?, ?, ?, ?, ?)
  `;
  pool.query(sql, [name, rollNo, year, department, timeTaken], (err, results) => {
    if (err) {
      console.error("Error inserting data: ", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({ message: "Submission successful!", submissionId: results.insertId });
  });
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
