const db = require("./config/db");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
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

require('dotenv').config();
console.log(process.env.PORT);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});



// Start Express & Socket.IO Server
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
io.listen(3001, () => {
  console.log("WebSocket server running on port 3001");
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
      user: process.env.EMAIL_USER,  
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
app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true, // Allow cookies and authorization headers
  methods: "GET,POST,PUT,DELETE", // Allowed methods
  allowedHeaders: "Content-Type,Authorization" // Allowed headers
}));


app.get("/api/auth/users", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Unauthorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, "e265c8e7b7d5ac89322c36640b46c2fd492946cc20b1cfecbb5877545e8db43ae64312366e32fed4b52eda2b200915964971ceee8d947fad0311561645e12aeb"); // Ensure you replace this with your actual secret key
    console.log("🔑 Token decoded:", decoded);

    const sql = "SELECT username, email FROM users WHERE id = ?";
    const [results] = await db.promise().query(sql, [decoded.id]); // Fixed `.promise().query()`

    if (results.length === 0) {
      console.log("❌ User not found for ID:", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    console.log("✅ User found:", user);
    res.json(user);
  } catch (err) {
    console.error("❌ JWT error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.get("/api/auth/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ error: "Unauthorized: No token" });
  }

  try {
      const decoded = jwt.verify(token, "e265c8e7b7d5ac89322c36640b46c2fd492946cc20b1cfecbb5877545e8db43ae64312366e32fed4b52eda2b200915964971ceee8d947fad0311561645e12aeb"); // Use your actual secret key
      console.log("🔑 Token decoded:", decoded);

      const sql = "SELECT username, email, role FROM users WHERE id = ?";
      db.query(sql, [decoded.id], (err, results) => {
          if (err) {
              console.error("❌ MySQL Error:", err);
              return res.status(500).json({ error: "Database error" });
          }

          if (results.length === 0) {
              console.log("❌ User not found for ID:", decoded.id);
              return res.status(404).json({ error: "User not found" });
          }

          const user = results[0];
          console.log("✅ User found:", user);
          res.json(user);
      });
  } catch (err) {
      console.error("❌ JWT error:", err.message);
      res.status(401).json({ error: "Invalid or expired token" });
  }
});

//ITO START NG ARDUINO GRRR RAWR RAWR HAHAHAHAHAH



//Set up SerialPort (Change COM3 to your correct port)
const serialPort = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

//Read and store data from Arduino
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

//API Route to Fetch Data
app.get("/data", (req, res) => {
  db.query("SELECT * FROM turbidity_readings ORDER BY id DESC LIMIT 10", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database Query Error" });
    }
    res.json(results);
  });
});

//Read and store data from Arduino
parser.on("data", (data) => {
  try {
    const jsonData = JSON.parse(data.trim());

    // Extract all sensor values from received JSON data
    const turbidityValue = jsonData.turbidity_value;
    const phValue = jsonData.ph_value;
    const tdsValue = jsonData.tds_value;
    const salinityValue = jsonData.salinity_value;
    const ecValue = jsonData.ec_value_mS;
    const ecCompensatedValue = jsonData.ec_compensated_mS;
    const temperatureValue = jsonData.temperature_celsius;

    // Handling Turbidity data
    if (turbidityValue !== undefined) {
      console.log("📡 Turbidity:", turbidityValue);

      const query = "INSERT INTO turbidity_readings (turbidity_value) VALUES (?)";
      db.query(query, [turbidityValue], (err, result) => {
        if (err) return console.error("Turbidity DB Error:", err);
        io.emit("updateTurbidityData", { value: turbidityValue });

        // === Notification Logic ===
        const threshold = 20;
        let status = "CLEAN";
        let message = "";

        if (turbidityValue > threshold) {
          status = "NOT_CLEAN";
          message = `⚠️ Warning! High turbidity detected (${turbidityValue}) — water not clean.`;
        } else {
          status = "CLEAN";
          message = `✅ Turbidity (${turbidityValue}) is safe — water is clean.`;
        }

        const notifQuery = "INSERT INTO notifications (message, turbidity, status) VALUES (?, ?, ?)";
        db.query(notifQuery, [message, turbidityValue, status], (err, result) => {
          if (err) return console.error("Notification DB Error:", err);
          console.log("🔔 Notification:", message);

          io.emit("newNotification", {
            id: result.insertId,
            message,
            turbidity: turbidityValue,
            status,
            created_at: new Date().toISOString(),
          });
        });
      });
    }

    // Handling TDS data
    if (tdsValue !== undefined) {
      console.log("📡 Received TDS Data:", tdsValue);
      const query = "INSERT INTO tds_readings (tds_value) VALUES (?)";
      db.query(query, [tdsValue], (err, result) => {
        if (err) {
          console.error("TDS Database Insert Error:", err);
        } else {
          console.log("TDS Data Inserted Successfully: ID", result.insertId);
          io.emit("updateTDSData", { value: tdsValue });
        }
      });
    }

    // Handling Salinity data
    if (salinityValue !== undefined) {
      console.log("📡 Received Salinity Data:", salinityValue);
      const query = "INSERT INTO salinity_readings (salinity_value) VALUES (?)";
      db.query(query, [salinityValue], (err, result) => {
        if (err) {
          console.error("Salinity Database Insert Error:", err);
        } else {
          console.log("Salinity Data Inserted Successfully: ID", result.insertId);
          io.emit("updateSalinityData", { value: salinityValue });
        }
      });
    }

    // Handling EC data
    if (ecValue !== undefined) {
      console.log("📡 Received EC Data (mS/cm):", ecValue);
      const query = "INSERT INTO ec_readings (ec_value_mS) VALUES (?)";
      db.query(query, [ecValue], (err, result) => {
        if (err) {
          console.error("EC Database Insert Error:", err);
        } else {
          console.log("EC Data Inserted Successfully: ID", result.insertId);
          io.emit("updateECData", { value: ecValue });
        }
      });
    }

    // Handling EC (Compensated) data
    if (ecCompensatedValue !== undefined) {
      console.log("📡 Received Compensated EC Data (mS/cm):", ecCompensatedValue);
      const query = "INSERT INTO ec_compensated_readings (ec_compensated_mS) VALUES (?)";
      db.query(query, [ecCompensatedValue], (err, result) => {
        if (err) {
          console.error("Compensated EC Database Insert Error:", err);
        } else {
          console.log("Compensated EC Data Inserted Successfully: ID", result.insertId);
          io.emit("updateECCompensatedData", { value: ecCompensatedValue });
        }
      });
    }

    // Handling Temperature data
    if (temperatureValue !== undefined) {
      console.log("📡 Received Temperature Data (°C):", temperatureValue);
      const query = "INSERT INTO temperature_readings (temperature_celsius) VALUES (?)";
      db.query(query, [temperatureValue], (err, result) => {
        if (err) {
          console.error("Temperature Database Insert Error:", err);
        } else {
          console.log("Temperature Data Inserted Successfully: ID", result.insertId);
          io.emit("updateTemperatureData", { value: temperatureValue });
        }
      });
    }

  } catch (err) {
    console.error("JSON Parse Error:", err);
  }
});

// Backend: Separate event for turbidity and pH level
parser.on("data", (data) => {
  try {
    const jsonData = JSON.parse(data.trim());

    const turbidityValue = jsonData.turbidity_value;
    const phValue = jsonData.ph_value;

    if (turbidityValue !== undefined) {
      console.log("📡 Received Turbidity Data:", turbidityValue);

      // Emit turbidity data update
      io.emit("updateTurbidityData", { value: turbidityValue });
    }

    if (phValue !== undefined) {
      console.log("📡 Received pH Data:", phValue);

      // Emit pH data update
      io.emit("updatePHData", { value: phValue });
    }

  } catch (err) {
    console.error("JSON Parse Error:", err);
  }
});



// Save user to the database
app.post('/save-user', (req, res) => {
  const { email, name } = req.body;

  // Insert user data into the 'users' table
  const query = 'INSERT INTO users (email, username) VALUES (?, ?)';
  db.query(query, [email, name], (err, result) => {
    if (err) {
      console.error('Error saving user:', err);
      return res.status(500).send('Error saving user');
    }
    res.status(200).send('User saved successfully');
  });
});

let sensorConnected = false;  // To keep track of sensor connection status

// Function to show the connection status
function showSensorConnectionStatus(isConnected) {
  if (isConnected) {
    console.log("Sensor is connected.");
  } else {
    console.log("Sensor is disconnected.");
  }
}

// Check if the sensor is connected when the port opens
serialPort.on("open", () => {
  if (!sensorConnected) {
    sensorConnected = true;  // Set to connected
    showSensorConnectionStatus(true);  // Show connected status
  }
});

// Listen for data from the sensor
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
      }
    });
  } catch (err) {
    console.error("JSON Parse Error:", err);
  }
});

// Handle sensor disconnection
serialPort.on("close", () => {
  if (sensorConnected) {
    sensorConnected = false;  // Set to disconnected
    showSensorConnectionStatus(false);  // Show disconnected status
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Route to get latest water quality data
app.get("/api/sensors/latest", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No water quality data found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching water quality data:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});