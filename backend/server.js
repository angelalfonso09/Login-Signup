const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io"); 

const app = express();
const port = 5000;
const saltRounds = 10;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "aquasense",
});

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aquasense",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = (sql, values) =>
  new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

module.exports = { pool, query };

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
  connection.release(); 
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

// Signup function
app.post("/users", async (req, res) => {
  const { username, email, phone, password, confirmPassword, role = "User" } = req.body;

  if (!username || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO users (username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, email, phone, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "User registered successfully", userId: result.insertId });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login function
app.post("/login", (req, res) => {
  console.log("Received Data:", req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Determine user role and redirect URL
    let redirectUrl = "/dashboard"; // Default for normal users
    if (user.role === "Admin") {
      redirectUrl = "/adminDB";
    } else if (user.role === "User") {
      redirectUrl = "/userDB";
    }

    res.json({
      message: "Login successful",
      userId: user.id,
      role: user.role,
      redirectUrl: redirectUrl, // Send redirect URL to frontend
    });
  });
});


// Create admin
app.post("/admin", async (req, res) => {
  console.log("📩 Received data:", req.body);

  const { username, email, password, confirmPassword, role } = req.body;

  // Validate required fields
  if (!username || !email || !password || !confirmPassword || !role) {
    console.log("❌ Missing fields:", { username, email, password, confirmPassword, role });
    return res.status(400).json({ error: "All fields are required" });
  }

  // Ensure passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  // Validate role selection
  const allowedRoles = ["Admin", "Super Admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role. Allowed roles: Admin, Super Admin" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("📝 Inserting into DB:", { username, email, role });

    // Store the role as selected by the user
    const sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("❌ Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("✅ User created successfully:", { userId: result.insertId, role });
      res.json({ message: "User created successfully", userId: result.insertId });
    });
  } catch (error) {
    console.error("❌ Error hashing password:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// fetch users
app.get("/api/users", async (req, res) => {
  try {
    const users = await query("SELECT id, username, email, role FROM users");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Database error while fetching users" });
  }
});

// delete
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Fetch the user's role before deleting
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user[0].role;

    // Check if the user is a Super Admin
    if (userRole === "Super Admin") {
      const [superAdmins] = await db.promise().query('SELECT COUNT(*) AS count FROM users WHERE role = "Super Admin"');

      if (superAdmins[0].count <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last Super Admin' });
      }
    }

    // Proceed with deletion
    const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


// edit account
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, phone } = req.body;

  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Update query
    const [result] = await db
      .promise()
      .query(
        'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?',
        [username, email, phone, userId]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// fecth data to display in navbar
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const [rows] = await db.promise().query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});



// Socket.io Configuration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Fetch Data & Emit to Clients
const fetchAndEmitData = () => {
  db.query("SELECT * FROM gauge_data ORDER BY id DESC LIMIT 1", (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return;
    }
    io.emit("updateData", result[0]); 
  });
};

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Send initial data when client connects
  fetchAndEmitData();

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Insert New Data & Emit Update
app.post("/insert", (req, res) => {
  const { value } = req.body;
  db.query("INSERT INTO gauge_data (value) VALUES (?)", [value], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      console.log("New Data Inserted:", value);
      fetchAndEmitData(); 
      res.status(201).json({ message: "Data inserted successfully" });
    }
  });
});


server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.get("/data", (req, res) => {
  db.query("SELECT * FROM gauge_data ORDER BY id DESC LIMIT 1", (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0]); // Send latest data
  });
});
