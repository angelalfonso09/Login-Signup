const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Example: Replace this with your actual DB model or query
const users = []; // Array of users, e.g., [{ email: 'test@mail.com', passwordHash: '...' }]

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    // Find the user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the password
    user.passwordHash = hashedPassword;

    return res.status(200).json({ message: 'Password successfully updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
