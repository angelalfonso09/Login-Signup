const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Ensure email credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!');
  process.exit(1);
}

// Create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password (not Gmail password)
  },
});

// Function to send OTP email
const sendOtpEmail = async (to, otp, purpose = 'verification') => {
  const subject = purpose === 'verification' ? 'Email Verification OTP' : 'Password Reset OTP';
  const text = `Your OTP code is: ${otp}\n\nPlease use this code to proceed. If you didn't request this, ignore this message.`;
  
  const mailOptions = {
    from: `"Aquasense" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

module.exports = sendOtpEmail;
