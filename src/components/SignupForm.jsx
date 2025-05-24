import React, { useState } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Signup/SignupForm.css';

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
      await axios.post("http://localhost:5000/send-email", {
        email: formData.email,
        subject: "Verify Your Email",
        message: `Your verification code is: 123456`, // You should generate a real code on the backend
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

    try {
      const response = await axios.post("http://localhost:5000/verify-code", {
        email: formData.email,
        code: verificationCode
      });

      if (response.data.success) {
        window.alert("✅ Verification successful!");
        setMessage("✅ Verification successful! Redirecting...");
        setShowModal(false);
        navigate("/login"); // Redirect to dashboard or login page
      } else {
        setMessage("❌ Invalid verification code. Please try again.");
      }
    } catch (error) {
      setMessage("❌ Verification failed: " + (error.response?.data.error || "Server error"));
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Username"
            name="username"
            id="username"
            className="input-field transparent-input"
            onChange={handleChange}
            autoComplete="username"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            className="input-field transparent-input"
            onChange={handleChange}
            autoComplete="email"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="tel"
            placeholder="Phone"
            name="phone"
            id="phone"
            className="input-field transparent-input"
            onChange={handleChange}
            autoComplete="tel"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="input-field transparent-input"
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            className="input-field transparent-input"
            onChange={handleChange}
            autoComplete="new-password"
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 gradient-btn">
          Sign Up
        </Button>

        {message && <p className="mt-3 text-center" style={{ color: message.includes("❌") ? "red" : "green" }}>{message}</p>}
      </Form>

      {/* Verification Code Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleVerification}>Verify</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SignupForm;