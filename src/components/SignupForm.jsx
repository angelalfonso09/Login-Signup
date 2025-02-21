import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import '../styles/Signup/SignupForm.css'; 

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(""); // For success/error messages

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setMessage("❌ All fields are required!");
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    try {
      // Send data to backend
      const response = await axios.post("http://localhost:5000/users", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, 
        confirmPassword: formData.confirmPassword,
      });

      setMessage("✅ " + response.data.message);
    } catch (error) {
      setMessage("❌ Signup failed: " + (error.response?.data.error || "Server error"));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Control 
          type="text" 
          placeholder="Username" 
          name="username"
          className="input-field transparent-input" 
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control 
          type="email" 
          placeholder="Email" 
          name="email"
          className="input-field transparent-input" 
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control 
          type="number" 
          placeholder="Phone" 
          name="phone"
          className="input-field transparent-input" 
          onChange={handleChange}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Control 
          type="password" 
          placeholder="Password" 
          name="password"
          className="input-field transparent-input" 
          onChange={handleChange}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Control 
          type="password" 
          placeholder="Confirm Password" 
          name="confirmPassword"
          className="input-field transparent-input" 
          onChange={handleChange}
        />
      </Form.Group>
      
      <Button type="submit" variant="primary" className="w-100 gradient-btn">
        Sign Up
      </Button>

      {/* Show success/error message */}
      {message && <p className="mt-3 text-center" style={{ color: message.includes("❌") ? "red" : "green" }}>{message}</p>}
    </Form>
  );
};

export default SignupForm;
