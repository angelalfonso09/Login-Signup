require("dotenv").config();

const db = require("./config/db");
const pool = require ("./config/db");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const router = express.Router();
const nodemailer = require("nodemailer");
const sendOtpEmail = require('./otpMailer');
const crypto = require("crypto");
const sendEmail = require("./mailer");
const { User } = require("../backend/models/user");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const cookieParser = require("cookie-parser");
const authRoutes = require("./models/route");
const app = express();
const port = 5000;
const saltRounds = 10;
// const users = [];


// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"], // React dev server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors()); // This handles the preflight OPTIONS requests

// Example middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the 'Authorization' header

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  console.log('🔐 Signing with JWT_SECRET:', process.env.JWT_SECRET);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    // Attach the decoded user data to the request object
    req.user = decoded;
    next(); // Call next middleware or handler
  });
};

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cookieParser());

const query = (sql, values) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

module.exports = { query };


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
    return res
      .status(400)
      .json({ error: "Email and verification code are required." });
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
  const {
    username,
    email,
    phone,
    password,
    confirmPassword,
    role = "User",
  } = req.body;

  if (!username || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationCode = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit code

    const sql =
      "INSERT INTO users (username, email, phone, password_hash, role, verification_code, is_verified) VALUES ( ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [username, email, phone, hashedPassword, role, verificationCode, 0],
      async (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Database error" });
        }

        try {
          await sendVerificationEmail(email, verificationCode);
          res.json({
            message:
              "User registered successfully. Check your email for verification.",
            userId: result.insertId,
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          res.status(500).json({ error: "Failed to send verification email" });
        }
      }
    );
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
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log('🔐 Signing with JWT_SECRET:', process.env.JWT_SECRET);
    console.log("Backend: Generated Auth Token for user:", token); // Log the generated token

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
    console.log("❌ Missing fields:", {
      username,
      email,
      password,
      confirmPassword,
      role,
    });
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const allowedRoles = ["Admin", "Super Admin"];
  if (!allowedRoles.includes(role)) {
    return res
      .status(400)
      .json({ error: "Invalid role. Allowed roles: Admin, Super Admin" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("📝 Inserting into DB:", { username, email, role });

    const sql =
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("❌ Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("✅ User created successfully:", {
        userId: result.insertId,
        role,
      });
      res.json({
        message: "User created successfully",
        userId: result.insertId,
      });
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
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const [user] = await db
      .promise()
      .query("SELECT role FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRole = user[0].role;

    if (userRole === "Super Admin") {
      const [superAdmins] = await db
        .promise()
        .query(
          'SELECT COUNT(*) AS count FROM users WHERE role = "Super Admin"'
        );

      if (superAdmins[0].count <= 1) {
        return res
          .status(403)
          .json({ error: "Cannot delete the last Super Admin" });
      }
    }

    const [result] = await db
      .promise()
      .query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// edit account
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, phone } = req.body;

  try {
    // Ensure the ID is a valid number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Ensure all required fields are provided
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    // Log the received data for debugging
    console.log(`🔹 Updating user ID: ${userId}, Data:`, {
      username,
      email,
      phone,
    });

    // Perform the update query
    const [result] = await db
      .promise()
      .query(
        "UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?",
        [username, email, phone || null, userId]
      );

    // Check if any rows were updated
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "User not found or no changes made" });
    }

    // Successfully updated user
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res
      .status(500)
      .json({ error: "Failed to update user. Please try again later." });
  }
});

// fetching for navbar
app.get("/api/auth/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("➡️ Request received for /api/auth/user. Token:", token);

  if (!token) {
    console.log("❌ No token provided in the Authorization header.");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your actual secret key
      console.log("🔑 Token successfully verified. Decoded payload:", decoded);
    } catch (jwtErr) {
      console.error("❌ JWT Verification Error:", jwtErr.message);
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token", details: jwtErr.message });
    }

    const userId = decoded.id;
    console.log("👤 Decoded User ID:", userId);

    try {
      const sql = "SELECT username, email, role FROM users WHERE id = ?";
      db.query(sql, [userId], (dbErr, results) => {
        if (dbErr) {
          console.error("❌ MySQL Query Error:", dbErr.message);
          return res.status(500).json({ error: "Database query error", details: dbErr.message });
        }

        if (results.length === 0) {
          console.log(`❌ User not found in database with ID: ${userId}`);
          return res.status(404).json({ error: "User not found in database" });
        }

        const user = results[0];
        console.log("✅ User data found:", user);
        res.json({ username: user.username, email: user.email, role: user.role });
      });
    } catch (dbQueryErr) {
      console.error("❌ Error executing database query:", dbQueryErr.message);
      return res.status(500).json({ error: "Error executing database query", details: dbQueryErr.message });
    }

  } catch (generalErr) {
    console.error("🔥 General error in /api/auth/user:", generalErr.message);
    return res.status(500).json({ error: "Internal server error", details: generalErr.message });
  }
});


// Forgot password route (OTP generation and sending)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in database or a temporary storage for validation
  const sql = 'UPDATE users SET reset_otp = ?, otp_expires = ? WHERE email = ?';
  const expiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  db.query(sql, [otp, expiration, email], async (err, result) => {
    if (err) {
      console.error('Error updating OTP:', err);
      return res.status(500).json({ message: 'Failed to store OTP in database.' });
    }

    // Send OTP email to the user
    try {
      await sendOtpEmail(email, otp, 'reset-password');
      res.status(200).json({
        message: 'OTP sent to your email. Please check your inbox.',
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
  });
});

// validtae itp
app.post('/api/validate-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const query = `SELECT reset_otp, otp_expires FROM users WHERE email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error during OTP validation:', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = results[0];
    const currentTime = new Date();
    const otpExpiration = new Date(user.otp_expires);

    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (currentTime > otpExpiration) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    return res.status(200).json({ message: 'OTP verified successfully.' });
  });
});

// Route to reset the password after OTP verification
app.post("/api/reset-password", async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log("Received token:", token);
  console.log("Using JWT_SECRET:", process.env.JWT_SECRET);

  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    console.log("Token decoded, userId:", userId);

    if (!newPassword || !confirmPassword) {
      console.log("Missing passwords.");
      return res.status(400).json({ message: "Both new password and confirm password are required." });
    }

    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match.");
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      console.log("Password is too short.");
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = 'UPDATE users SET password_hash = ? WHERE id = ?';

    db.query(updateQuery, [hashedPassword, userId], (err, result) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Failed to update the password." });
      }

      if (result.affectedRows === 0) {
        console.log("User not found.");
        return res.status(404).json({ message: "User not found." });
      }

      console.log("Password updated successfully.");
      return res.status(200).json({ message: "Password reset successful!" });
    });

  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
});

// GET route to fetch establishments
app.get('/api/establishments', (req, res) => {
  const sql = 'SELECT estab_name FROM estab';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Failed to fetch establishments' });
    } else {
      // Extract the establishment names from the results
      const estabNames = results.map(row => row.estab_name);
      res.json(estabNames);
    }
  });
});

// POST route to add an establishment
app.post('/api/establishments', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO estab (estab_name) VALUES (?)';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).json({ error: 'Failed to add establishment', details: err }); // Include the error details
    } else {
      console.log('Establishment added successfully', result); // Log the result
      res.status(201).json({ message: 'Establishment added successfully' });
    }
  });
});


// API endpoint to get total users
app.get('/api/total-users', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalUsers FROM users'; // Assuming your user table is named 'users'

  console.log('Attempting to fetch total users from the database...');

  pool.query(query, (error, results) => {
    if (error) {
      console.error('Database query error when fetching total users:', error.message);

      // Log more specific details from the MySQL error object
      if (error.code) {
        console.error(`MySQL Error Code: ${error.code}`);
      }
      if (error.sqlMessage) {
        console.error(`MySQL Error Message: ${error.sqlMessage}`);
      }
      if (error.sql) {
        console.error(`Faulty SQL Query: ${error.sql}`);
      }

      // Send a 500 Internal Server Error response to the client
      return res.status(500).json({
        error: 'Failed to fetch total users due to a server-side database error.',
        details: error.message // Include error message for debugging purposes (consider removing in production)
      });
    }

    // Check if results are valid and contain the expected data
    if (results && results.length > 0 && results[0].hasOwnProperty('totalUsers')) {
      const totalUsers = results[0].totalUsers;
      console.log(`Successfully fetched total users: ${totalUsers}`);
      res.json({ totalUsers: totalUsers });
    } else {
      // This case handles unexpected query results (e.g., empty results, or missing 'totalUsers' column)
      console.warn('Query for total users returned an unexpected or empty result set:', results);
      return res.status(500).json({
        error: 'Failed to retrieve total users count; unexpected database response format.',
        details: 'The database query returned an invalid or empty result for total users.'
      });
    }
  });
});

// fetxh estab
app.get('/api/total-establishments', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalEstablishments FROM estab';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total establishments:', err);
      return res.status(500).json({ error: 'Failed to fetch total establishments' });
    }

    const total = results[0].totalEstablishments;
    res.json({ totalEstablishments: total });
  });
});

// ✅ Direct endpoint for fetching total sensors
app.get('/api/total-sensors', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalSensors FROM sensors'; // Adjust table name if needed

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total sensors:', err);
      return res.status(500).json({ error: 'Failed to fetch total sensors' });
    }

    const total = results[0].totalSensors;
    res.json({ totalSensors: total });
  });
});

// fetch for the modal
app.get('/api/total-sensors', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalSensors FROM sensors'; // Replace 'sensors' with your actual table name

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total sensors:', err);
      return res.status(500).json({ error: 'Failed to fetch total sensors' });
    }

    const total = results[0].totalSensors;
    res.json({ totalSensors: total });
  });
});

//ITO START NG ARDUINO GRRR RAWR RAWR HAHAHAHAHAH

// //Set up SerialPort (Change COM3 to your correct port)
// const serialPort = new SerialPort({ path: "COM3", baudRate: 9600 });
// const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

// //Read and store data from Arduino
// parser.on("data", (data) => {
//   try {
//     const jsonData = JSON.parse(data.trim());
//     const turbidityValue = jsonData.turbidity_value;

//     console.log("📡 Received Data:", turbidityValue);

//     // Insert into MySQL
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

// //API Route to Fetch Data
// app.get("/data", (req, res) => {
//   db.query("SELECT * FROM turbidity_readings ORDER BY id DESC LIMIT 10", (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database Query Error" });
//     }
//     res.json(results);
//   });
// });

// //Read and store data from Arduino
// parser.on("data", (data) => {
//   try {
//     const jsonData = JSON.parse(data.trim());

//     // Extract all sensor values from received JSON data
//     const turbidityValue = jsonData.turbidity_value;
//     const phValue = jsonData.ph_value;
//     const tdsValue = jsonData.tds_value;
//     const salinityValue = jsonData.salinity_value;
//     const ecValue = jsonData.ec_value_mS;
//     const ecCompensatedValue = jsonData.ec_compensated_mS;
//     const temperatureValue = jsonData.temperature_celsius;

//     // Handling Turbidity data

// if (turbidityValue !== undefined) {
//   console.log("📡 Received Turbidity Data:", turbidityValue);

//   // Insert into turbidity_readings
//   const query = "INSERT INTO turbidity_readings (turbidity_value) VALUES (?)";
//   db.query(query, [turbidityValue], (err, result) => {
//     if (err) {
//       console.error("❌ Turbidity Database Insert Error:", err.sqlMessage);
//       return;
//     }
//     console.log("✅ Turbidity Data Inserted Successfully: ID", result.insertId);

//     // Emit the turbidity data to clients via socket.io
//     io.emit("updateTurbidityData", { value: turbidityValue });

//     // Only insert the notification if turbidity is below threshold (40)
//     if (turbidityValue < 40) {
//       insertNotification(result.insertId, turbidityValue);
//     }
//   });
// }

// function insertNotification(water_quality_id, turbidityValue) {
//   const threshold = 40;
//   const status = 'Unread'; // Since turbidity is less than threshold, status is 'Unread'
//   const message = `⚠️ Alert: Turbidity level dropped below threshold (${threshold}). Current value: ${turbidityValue}`;

//   const notifQuery = `
//     INSERT INTO notifications (water_quality_id, message, status)
//     VALUES (?, ?, ?)
//   `;

//   db.query(notifQuery, [water_quality_id, message, status], (notifErr, notifResult) => {
//     if (notifErr) {
//       console.error("❌ Notification Insert Error:", notifErr.sqlMessage);
//       console.error("❌ Full SQL:", notifErr.sql);
//     } else {
//       console.log("⚠️ Notification Inserted Successfully: ID", notifResult.insertId);

//       // Emit the notification data to clients via socket.io
//       io.emit("newNotification", { message: message, status: status });
//     }
//   });
// }

//     // Handling pH data
//     if (phValue !== undefined) {
//       console.log("📡 Received pH Level Data:", phValue);
//       const query = "INSERT INTO phlevel_readings (ph_value) VALUES (?)";
//       db.query(query, [phValue], (err, result) => {
//         if (err) {
//           console.error("pH Database Insert Error:", err);
//         } else {
//           console.log("pH Data Inserted Successfully: ID", result.insertId);
//           io.emit("updatePHData", { value: phValue });
//         }
//       });
//     }

//     // Handling TDS data
//     if (tdsValue !== undefined) {
//       console.log("📡 Received TDS Data:", tdsValue);
//       const query = "INSERT INTO tds_readings (tds_value) VALUES (?)";
//       db.query(query, [tdsValue], (err, result) => {
//         if (err) {
//           console.error("TDS Database Insert Error:", err);
//         } else {
//           console.log("TDS Data Inserted Successfully: ID", result.insertId);
//           io.emit("updateTDSData", { value: tdsValue });
//         }
//       });
//     }

//     // Handling Salinity data
//     if (salinityValue !== undefined) {
//       console.log("📡 Received Salinity Data:", salinityValue);
//       const query = "INSERT INTO salinity_readings (salinity_value) VALUES (?)";
//       db.query(query, [salinityValue], (err, result) => {
//         if (err) {
//           console.error("Salinity Database Insert Error:", err);
//         } else {
//           console.log("Salinity Data Inserted Successfully: ID", result.insertId);
//           io.emit("updateSalinityData", { value: salinityValue });
//         }
//       });
//     }

//     // Handling EC data
//     if (ecValue !== undefined) {
//       console.log("📡 Received EC Data (mS/cm):", ecValue);
//       const query = "INSERT INTO ec_readings (ec_value_mS) VALUES (?)";
//       db.query(query, [ecValue], (err, result) => {
//         if (err) {
//           console.error("EC Database Insert Error:", err);
//         } else {
//           console.log("EC Data Inserted Successfully: ID", result.insertId);
//           io.emit("updateECData", { value: ecValue });
//         }
//       });
//     }

//     // Handling EC (Compensated) data
//     if (ecCompensatedValue !== undefined) {
//       console.log("📡 Received Compensated EC Data (mS/cm):", ecCompensatedValue);
//       const query = "INSERT INTO ec_compensated_readings (ec_compensated_mS) VALUES (?)";
//       db.query(query, [ecCompensatedValue], (err, result) => {
//         if (err) {
//           console.error("Compensated EC Database Insert Error:", err);
//         } else {
//           console.log("Compensated EC Data Inserted Successfully: ID", result.insertId);
//           io.emit("updateECCompensatedData", { value: ecCompensatedValue });
//         }
//       });
//     }

//     // Handling Temperature data
//     if (temperatureValue !== undefined) {
//       console.log("📡 Received Temperature Data (°C):", temperatureValue);
//       const query = "INSERT INTO temperature_readings (temperature_celsius) VALUES (?)";
//       db.query(query, [temperatureValue], (err, result) => {
//         if (err) {
//           console.error("Temperature Database Insert Error:", err);
//         } else {
//           console.log("Temperature Data Inserted Successfully: ID", result.insertId);
//           io.emit("updateTemperatureData", { value: temperatureValue });
//         }
//       });
//     }

//   } catch (err) {
//     console.error("JSON Parse Error:", err);
//   }
// });

// // Backend: Separate event for turbidity and pH level
// parser.on("data", (data) => {
//   try {
//     const jsonData = JSON.parse(data.trim());

//     const turbidityValue = jsonData.turbidity_value;
//     const phValue = jsonData.ph_value;

//     if (turbidityValue !== undefined) {
//       console.log("📡 Received Turbidity Data:", turbidityValue);

//       // Emit turbidity data update
//       io.emit("updateTurbidityData", { value: turbidityValue });
//     }

//     if (phValue !== undefined) {
//       console.log("📡 Received pH Data:", phValue);

//       // Emit pH data update
//       io.emit("updatePHData", { value: phValue });
//     }

//   } catch (err) {
//     console.error("JSON Parse Error:", err);
//   }
// });

// let sensorConnected = false;  // To keep track of sensor connection status

// // Function to show the connection status
// function showSensorConnectionStatus(isConnected) {
//   if (isConnected) {
//     console.log("Sensor is connected.");
//   } else {
//     console.log("Sensor is disconnected.");
//   }
// }

// // Check if the sensor is connected when the port opens
// serialPort.on("open", () => {
//   if (!sensorConnected) {
//     sensorConnected = true;  // Set to connected
//     showSensorConnectionStatus(true);  // Show connected status
//   }
// });

// // Listen for data from the sensor
// parser.on("data", (data) => {
//   try {
//     const jsonData = JSON.parse(data.trim());
//     const turbidityValue = jsonData.turbidity_value;

//     console.log("📡 Received Data:", turbidityValue);

//     // Insert into MySQL
//     const query = "INSERT INTO turbidity_readings (turbidity_value) VALUES (?)";
//     db.query(query, [turbidityValue], (err, result) => {
//       if (err) {
//         console.error("Database Insert Error:", err);
//       } else {
//         console.log("Data Inserted Successfully: ID", result.insertId);
//       }
//     });
//   } catch (err) {
//     console.error("JSON Parse Error:", err);
//   }
// });

// // Handle sensor disconnection
// serialPort.on("close", () => {
//   if (sensorConnected) {
//     sensorConnected = false;  // Set to disconnected
//     showSensorConnectionStatus(false);  // Show disconnected status
//   }
// });
// __________________________________________
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // ✅ Route to get latest water quality data
// app.get("/api/sensors/latest", async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1`
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "No water quality data found." });
//     }

//     res.json(rows[0]);
//   } catch (err) {
//     console.error("❌ Error fetching water quality data:", err.message);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// // Middleware to authenticate JWT tokens
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

//   if (!token) {
//     return res.status(403).json({ error: "Token required" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: "Invalid token" });
//     }
//     req.user = user;
//     next();
//   });
// };

// // Get unread notifications
// app.get("/api/notifications/unread", authenticateToken, (req, res) => {
//   const query = "SELECT id, message, created_at, status FROM notifications WHERE status = 'Unread' ORDER BY created_at DESC";

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching notifications:", err);
//       return res.status(500).json({ error: "Failed to fetch notifications" });
//     }
//     res.json(results || []); // Send the unread notifications back to the client
//   });
// });

// // Mark notifications as read (optional for a feature where the backend updates read status)
// app.post("/api/notifications/mark-read", authenticateToken, (req, res) => {
//   const query = "UPDATE notifications SET status = 'Read' WHERE status = 'Unread'";

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Error updating notifications:", err);
//       return res.status(500).json({ error: "Failed to update notifications" });
//     }
//     res.json({ message: "Notifications marked as read" });
//   });
// });

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

 // CLEAN VERSION NG BACKEND FOR GAUGE METER AND HISTORICAL DATA RAWR RAWR RAWR RAWR RAWR
 // CLEAN VERSION NG BACKEND FOR GAUGE METER AND HISTORICAL DATA RAWR RAWR RAWR RAWR RAWR
 // CLEAN VERSION NG BACKEND FOR GAUGE METER AND HISTORICAL DATA RAWR RAWR RAWR RAWR RAWR
 // CLEAN VERSION NG BACKEND FOR GAUGE METER AND HISTORICAL DATA RAWR RAWR RAWR RAWR RAWR

// Serial Port Configuration
const serialPort = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

let sensorConnected = false;

serialPort.on("open", () => {
    if (!sensorConnected) {
        sensorConnected = true;
        console.log("Sensor is connected on COM5 RAWR.");
    }
});

serialPort.on("close", () => {
    if (sensorConnected) {
        sensorConnected = false;
        console.log("Sensor is disconnected from COM3.");
    }
});

serialPort.on("error", (err) => {
    console.error("Serial Port Error:", err.message);
});

// --- Consolidated Data Handling from Arduino (This is where your parser.on('data') block goes) ---
parser.on("data", (data) => {
    try {
        const jsonData = JSON.parse(data.trim());

        const {
            turbidity_value,
            ph_value,
            tds_value,
            salinity_value,
            ec_value_mS,
            ec_compensated_mS,
            temperature_celsius
        } = jsonData;

        const currentTime = new Date(); // Get current server time for timestamp

        // Function to insert data into a table and emit via Socket.IO
        const insertAndEmit = (tableName, valueColumn, value, socketEventName, threshold = null, notificationType = 'turbidity') => {
            if (value !== undefined) {
                console.log(`📡 Received ${valueColumn} Data:`, value);
                const query = `INSERT INTO ${tableName} (${valueColumn}, timestamp) VALUES (?, ?)`;
                db.query(query, [value, currentTime], (err, result) => {
                    if (err) {
                        console.error(`❌ ${tableName} Database Insert Error:`, err.sqlMessage);
                        return;
                    }
                    console.log(`✅ ${tableName} Data Inserted Successfully: ID`, result.insertId);

                    io.emit(socketEventName, { value: value, timestamp: currentTime.toISOString() });

                    // Handle notifications for turbidity (can extend for others)
                    if (notificationType === 'turbidity' && threshold !== null && value < threshold) {
                        insertNotification(result.insertId, value);
                    }
                });
            }
        };

        // Handle each sensor type
        insertAndEmit('turbidity_readings', 'turbidity_value', turbidity_value, 'updateTurbidityData', 40, 'turbidity');
        insertAndEmit('phlevel_readings', 'ph_value', ph_value, 'updatePHData');
        insertAndEmit('tds_readings', 'tds_value', tds_value, 'updateTDSData');
        insertAndEmit('salinity_readings', 'salinity_value', salinity_value, 'updateSalinityData');
        insertAndEmit('ec_readings', 'ec_value_mS', ec_value_mS, 'updateECData');
        insertAndEmit('ec_compensated_readings', 'ec_compensated_mS', ec_compensated_mS, 'updateECCompensatedData');
        insertAndEmit('temperature_readings', 'temperature_celsius', temperature_celsius, 'updateTemperatureData');

    } catch (err) {
        console.error("JSON Parse Error:", err);
    }
});

function insertNotification(water_quality_id, turbidityValue) {
    const threshold = 40;
    const status = 'Unread';
    const message = `⚠️ Alert: Turbidity level dropped below threshold (${threshold}). Current value: ${turbidityValue}`;

    const notifQuery = `
        INSERT INTO notifications (water_quality_id, message, status, created_at)
        VALUES (?, ?, ?, NOW())
    `;

    db.query(notifQuery, [water_quality_id, message, status], (notifErr, notifResult) => {
        if (notifErr) {
            console.error("❌ Notification Insert Error:", notifErr.sqlMessage);
        } else {
            console.log("⚠️ Notification Inserted Successfully: ID", notifResult.insertId);
            io.emit("newNotification", { message: message, status: status });
        }
    });
}

// Helper function to fetch data for a given sensor table and value column
const getHistoricalData = (tableName, valueColumn, timePeriod, res) => {
    let query;
    let params = [];

    switch (timePeriod) {
        case 'realtime': // For initial real-time load (e.g., last 20 minutes)
            query = `SELECT ${valueColumn} AS value, timestamp FROM ${tableName} WHERE timestamp >= NOW() - INTERVAL 20 MINUTE ORDER BY timestamp ASC`;
            break;
        case '24h':
            query = `SELECT ${valueColumn} AS value, timestamp FROM ${tableName} WHERE timestamp >= NOW() - INTERVAL 24 HOUR ORDER BY timestamp ASC`;
            break;
        case '7d-avg':
            query = `
                SELECT
                    DATE(timestamp) AS timestamp,
                    AVG(${valueColumn}) AS value
                FROM ${tableName}
                WHERE timestamp >= NOW() - INTERVAL 7 DAY
                GROUP BY DATE(timestamp)
                ORDER BY timestamp ASC
            `;
            break;
        case '30d-avg':
            query = `
                SELECT
                    DATE(timestamp) AS timestamp,
                    AVG(${valueColumn}) AS value
                FROM ${tableName}
                WHERE timestamp >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE(timestamp)
                ORDER BY timestamp ASC
            `;
            break;
        default:
            return res.status(400).json({ error: "Invalid time period specified." });
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(`Database Query Error for ${tableName} (${timePeriod}):`, err);
            return res.status(500).json({ error: "Database Query Error" });
        }
        res.json(results);
    });
};

// --- Turbidity Endpoints ---
app.get("/data/turbidity/realtime", (req, res) => getHistoricalData('turbidity_readings', 'turbidity_value', 'realtime', res));
app.get("/data/turbidity/24h", (req, res) => getHistoricalData('turbidity_readings', 'turbidity_value', '24h', res));
app.get("/data/turbidity/7d-avg", (req, res) => getHistoricalData('turbidity_readings', 'turbidity_value', '7d-avg', res));
app.get("/data/turbidity/30d-avg", (req, res) => getHistoricalData('turbidity_readings', 'turbidity_value', '30d-avg', res));

// --- pH Level Endpoints ---
app.get("/data/phlevel/realtime", (req, res) => getHistoricalData('phlevel_readings', 'ph_value', 'realtime', res));
app.get("/data/phlevel/24h", (req, res) => getHistoricalData('phlevel_readings', 'ph_value', '24h', res));
app.get("/data/phlevel/7d-avg", (req, res) => getHistoricalData('phlevel_readings', 'ph_value', '7d-avg', res));
app.get("/data/phlevel/30d-avg", (req, res) => getHistoricalData('phlevel_readings', 'ph_value', '30d-avg', res));

// --- TDS Endpoints ---
app.get("/data/tds/realtime", (req, res) => getHistoricalData('tds_readings', 'tds_value', 'realtime', res));
app.get("/data/tds/24h", (req, res) => getHistoricalData('tds_readings', 'tds_value', '24h', res));
app.get("/data/tds/7d-avg", (req, res) => getHistoricalData('tds_readings', 'tds_value', '7d-avg', res));
app.get("/data/tds/30d-avg", (req, res) => getHistoricalData('tds_readings', 'tds_value', '30d-avg', res));

// --- Salinity Endpoints ---
app.get("/data/salinity/realtime", (req, res) => getHistoricalData('salinity_readings', 'salinity_value', 'realtime', res));
app.get("/data/salinity/24h", (req, res) => getHistoricalData('salinity_readings', 'salinity_value', '24h', res));
app.get("/data/salinity/7d-avg", (req, res) => getHistoricalData('salinity_readings', 'salinity_value', '7d-avg', res));
app.get("/data/salinity/30d-avg", (req, res) => getHistoricalData('salinity_readings', 'salinity_value', '30d-avg', res));

// --- EC Endpoints ---
app.get("/data/ec/realtime", (req, res) => getHistoricalData('ec_readings', 'ec_value_mS', 'realtime', res));
app.get("/data/ec/24h", (req, res) => getHistoricalData('ec_readings', 'ec_value_mS', '24h', res));
app.get("/data/ec/7d-avg", (req, res) => getHistoricalData('ec_readings', 'ec_value_mS', '7d-avg', res));
app.get("/data/ec/30d-avg", (req, res) => getHistoricalData('ec_readings', 'ec_value_mS', '30d-avg', res));

// --- Compensated EC Endpoints ---
app.get("/data/ec-compensated/realtime", (req, res) => getHistoricalData('ec_compensated_readings', 'ec_compensated_mS', 'realtime', res));
app.get("/data/ec-compensated/24h", (req, res) => getHistoricalData('ec_compensated_readings', 'ec_compensated_mS', '24h', res));
app.get("/data/ec-compensated/7d-avg", (req, res) => getHistoricalData('ec_compensated_readings', 'ec_compensated_mS', '7d-avg', res));
app.get("/data/ec-compensated/30d-avg", (req, res) => getHistoricalData('ec_compensated_readings', 'ec_compensated_mS', '30d-avg', res));

// --- Temperature Endpoints ---
app.get("/data/temperature/realtime", (req, res) => getHistoricalData('temperature_readings', 'temperature_celsius', 'realtime', res));
app.get("/data/temperature/24h", (req, res) => getHistoricalData('temperature_readings', 'temperature_celsius', '24h', res));
app.get("/data/temperature/7d-avg", (req, res) => getHistoricalData('temperature_readings', 'temperature_celsius', '7d-avg', res));
app.get("/data/temperature/30d-avg", (req, res) => getHistoricalData('temperature_readings', 'temperature_celsius', '30d-avg', res));