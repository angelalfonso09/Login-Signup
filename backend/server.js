const db = require("./config/db");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendEmail = require("./mailer");
const { User } = require("../backend/models/user");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cookieParser = require("cookie-parser");
const authRoutes = require('./models/route');

const app = express();
const port = 5000;
const saltRounds = 10;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both ports
    credentials: true,
  })
);

const query = (sql, values) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

module.exports = { query };

// Set up SerialPort (Change COM3 to your correct port)
const serialPort = new SerialPort({ path: "COM3", baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

// Read and store data from Arduino
parser.on("data", (data) => {
  try {
    const jsonData = JSON.parse(data.trim());
    const turbidityValue = jsonData.turbidity_value;

    console.log("📡 Received Data:", turbidityValue);

    // Insert into MySQL
    const query = "INSERT INTO turbidity_readings (turbidity_value) VALUES (?)";
    db.query(query, [turbidityValue], (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
      } else {
        console.log("Data Inserted Successfully: ID", result.insertId);

        // Emit real-time data update
        io.emit("updateData", { value: turbidityValue });
      }
    });
  } catch (err) {
    console.error("JSON Parse Error:", err);
  }
});

// API Route to Fetch Data
app.get("/data", (req, res) => {
  db.query("SELECT * FROM turbidity_readings ORDER BY id DESC LIMIT 10", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database Query Error" });
    }
    res.json(results);
  });
});

// mailer function
app.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  const response = await sendEmail(email, subject, message);
  res.json(response);
});

// verify code function
app.post("/verify-code", (req, res) => {
  console.log("Received request:", req.body); // Log request data

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  // Query the database to find the user
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = results[0]; // Get user data

    // Check verification code
    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    // Update user to set them as verified
    const updateSql = "UPDATE users SET is_verified = 1 WHERE email = ?";
    db.query(updateSql, [email], (updateErr) => {
      if (updateErr) {
        console.error("Error updating user:", updateErr);
        return res.status(500).json({ error: "Failed to verify user." });
      }

      res.json({ success: true, message: "Verification successful!" });
    });
  });
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
    const verificationCode = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit code

    const sql = "INSERT INTO users (username, email, phone, password_hash, role, verification_code, is_verified) VALUES ( ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [username, email, phone, hashedPassword, role, verificationCode, 0], async (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      try {
        await sendVerificationEmail(email, verificationCode);
        res.json({ message: "User registered successfully. Check your email for verification.", userId: result.insertId });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        res.status(500).json({ error: "Failed to send verification email" });
      }
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Function to send verification email
async function sendVerificationEmail(to, code) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,  // Use environment variables
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification Code",
    text: `Your verification code is: ${code}`,
  };

  await transporter.sendMail(mailOptions);
}

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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "your_secret_key",
      { expiresIn: "1h" }
    );

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
      token: token, // Send JWT token to frontend
      redirectUrl: redirectUrl, // Send redirect URL to frontend
    });
  });
});

// Create admin
app.post("/admin", async (req, res) => {
  console.log("📩 Received data:", req.body);

  const { username, email, password, confirmPassword, role } = req.body;

  if (!username || !email || !password || !confirmPassword || !role) {
    console.log("❌ Missing fields:", { username, email, password, confirmPassword, role });
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const allowedRoles = ["Admin", "Super Admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role. Allowed roles: Admin, Super Admin" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("📝 Inserting into DB:", { username, email, role });

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

    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = user[0].role;

    if (userRole === "Super Admin") {
      const [superAdmins] = await db.promise().query('SELECT COUNT(*) AS count FROM users WHERE role = "Super Admin"');

      if (superAdmins[0].count <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last Super Admin' });
      }
    }

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
    // Ensure the ID is a valid number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Ensure all required fields are provided
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Log the received data for debugging
    console.log(`🔹 Updating user ID: ${userId}, Data:`, { username, email, phone });

    // Perform the update query
    const [result] = await db
      .promise()
      .query(
        'UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?',
        [username, email, phone || null, userId]
      );

    // Check if any rows were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no changes made' });
    }

    // Successfully updated user
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user. Please try again later.' });
  }
});


// fetch data to display in navbar
app.get("/api/auth/users", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    console.log("Token decoded:", decoded);

    const sql = "SELECT username, email FROM users WHERE id = ?";
    db.query(sql, [decoded.id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        console.log("User not found for ID:", decoded.id);
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      console.log("✅ User found:", user);
      res.json({ username: user.username, email: user.email });
    });
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

//  Read and store data from Arduino
// parser.on("data", (data) => {
//   try {
//     const jsonData = JSON.parse(data.trim());
//     const turbidityValue = jsonData.turbidity_value;

//     console.log("📡 Received Data:", turbidityValue);

//     //  Insert into MySQL
//     const query = "INSERT INTO turbidity_readings (turbidity_value) VALUES (?)";
//     db.query(query, [turbidityValue], (err, result) => {
//       if (err) {
//         console.error("Database Insert Error:", err);
//       } else {
//         console.log("Data Inserted Successfully: ID", result.insertId);

//         // Emit real-time data update
//         io.emit("updateData", { value: turbidityValue });
//       }
//     });
//   } catch (err) {
//     console.error("JSON Parse Error:", err);
//   }
// });

// // API Route to Fetch Data
// app.get("/data", (req, res) => {
//   db.query("SELECT * FROM turbidity_readings ORDER BY id DESC LIMIT 10", (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database Query Error" });
//     }
//     res.json(results);
//   });
// });

// Start Express & Socket.IO Server
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
io.listen(3001, () => {
  console.log("WebSocket server running on port 3001");
});
