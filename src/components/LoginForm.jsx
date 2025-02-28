import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";  
import '../styles/Login/LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    console.log("Form Data Before Sending:", formData); 

    if (!formData.username || !formData.password) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/login", formData, {
        headers: { "Content-Type": "application/json" }
      });

      const { user, token, role, redirectUrl } = response.data;

      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(user)); // ✅ User data for Navbar
      localStorage.setItem("token", token); // ✅ Token for authentication
      localStorage.setItem("userRole", role); // ✅ Role tracking

      alert(`✅ Login successful! Redirecting to ${redirectUrl}...`);
      navigate(redirectUrl); // Redirect dynamically based on role

    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      setErrorMessage(error.response?.data?.error || "Login failed. Try again.");
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <Form.Group className="mb-3">
        <Form.Control 
          type="text" 
          name="username"
          placeholder="Username" 
          className="input-field transparent-input" 
          value={formData.username} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Control 
          type="password" 
          name="password"
          placeholder="Password" 
          className="input-field transparent-input" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Remember me" className="text-white" />
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100 gradient-btn">
        Login
      </Button>

      {errorMessage && <p className="mt-3 text-center text-danger">{errorMessage}</p>}

      <div className="text-center mt-3">
        <a href="/forgotpassword" className="text-white">Forgot Password?</a>
      </div>
    </Form>
  );
};

export default LoginForm;
