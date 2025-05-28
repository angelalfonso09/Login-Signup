import React, { useState, useContext } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Signup/SignupForm.css';
import { ThemeContext } from '../context/ThemeContext'; // Import ThemeContext

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext); // Use ThemeContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to validate password
  const validatePassword = (password) => {
    // Password must be at least 8 characters long
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    // Password must contain at least one number
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null; // Password is valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setMessage("❌ All fields are required!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    // Validate password using the new function
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setMessage(`❌ ${passwordError}`);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/users", formData);
      setMessage("✅ " + response.data.message);
      setShowModal(true);

      // Send email after successful signup
      // Ensure this matches what your backend /send-email expects
      await axios.post("http://localhost:5000/send-email", {
        email: formData.email,
        subject: "Verify Your Email",
        message: `Your verification code is: [OTP_PLACEHOLDER]`, // Use placeholder for backend to fill
      });

    } catch (error) {
      setMessage("❌ Signup failed: " + (error.response?.data.error || "Server error"));
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setMessage("❌ Please enter a verification code!");
      return;
    }

    // --- ADDED FOR DEBUGGING ---
    console.log("Attempting to verify code from SignupForm...");
    console.log("Email being sent for verification:", formData.email);
    console.log("Verification code being sent:", verificationCode);
    // --- END DEBUGGING ---

    try {
      const response = await axios.post("http://localhost:5000/verify-code", {
        email: formData.email,
        code: verificationCode
      });

      if (response.data.success) {
        setMessage("✅ Verification successful! Redirecting...");
        setShowModal(false);
        navigate("/login"); // Redirect to dashboard or login page
      } else {
        setMessage("❌ Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("❌ Verification failed:", error.response?.data || error);
      setMessage("❌ Verification failed: " + (error.response?.data.error || "Server error"));
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Control
            type="text"
            placeholder="Username"
            name="username"
            id="username"
            onChange={handleChange}
            autoComplete="username"
            className={`input-field ${theme}`}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Control
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            onChange={handleChange}
            autoComplete="email"
            className={`input-field ${theme}`}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Control
            type="tel"
            placeholder="Phone"
            name="phone"
            id="phone"
            onChange={handleChange}
            autoComplete="tel"
            className={`input-field ${theme}`}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            onChange={handleChange}
            autoComplete="new-password"
            className={`input-field ${theme}`}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            onChange={handleChange}
            autoComplete="new-password"
            className={`input-field ${theme}`}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 gradient-btn">
          Sign Up
        </Button>

        {/* Apply a unique class for the message and use theme for color */}
        {message && (
          <p className={`mt-3 text-center signup-form-message ${message.includes("❌") ? 'error' : 'success'}`}>
            {message}
          </p>
        )}
      </Form>

      {/* Verification Code Modal - Added unique className and theme */}
      {/* Bootstrap Modals add classes like .modal, .modal-dialog, .modal-content.
          We'll target .modal-content inside our unique class for theming. */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className={`signup-verification-modal ${theme}`}>
        <Modal.Header closeButton>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the verification code sent to your email:</p>
          <Form.Control
            type="text"
            placeholder="Verification Code"
            id="verificationCode"
            name="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            autoComplete="one-time-code"
            className="input-field" // Apply input-field class to modal input
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleVerification} className="gradient-btn"> {/* Apply gradient-btn to modal button */}
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignupForm;