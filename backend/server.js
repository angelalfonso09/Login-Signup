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

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "aquasense",
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
  const { username, email, phone, password, confirmPassword } = req.body;

  if (!username || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, phone, hashedPassword], (err, result) => {
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

    res.json({ message: "Login successful", userId: user.id });
  });
});

// Create admin
app.post("/admin", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO admin (username, email, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error inserting admin:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Admin created successfully", adminId: result.insertId });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all users 
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Fetch all admins 
app.get("/api/admin", (req, res) => {
  db.query("SELECT * FROM admin", (err, results) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
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
