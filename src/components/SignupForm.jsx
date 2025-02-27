import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
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
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    try {
      const response = await axios.post("http://localhost:5000/users", formData);
      setMessage("✅ " + response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
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

      <Form.Group className="mb-3">
        <Form.Control 
          type="hidden" 
          name="role" 
          value={formData.role} 
          className="input-field transparent-input" 
          readOnly 
        />
      </Form.Group>
      
      <Button type="submit" variant="primary" className="w-100 gradient-btn">
        Sign Up
      </Button>

      {message && <p className="mt-3 text-center" style={{ color: message.includes("❌") ? "red" : "green" }}>{message}</p>}
    </Form>
  );
};

export default SignupForm;
