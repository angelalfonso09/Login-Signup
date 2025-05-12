import React, { useState } from "react";
import { Form, Button, FormCheck } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Login/LoginForm.css'; // Make sure this import is correct
import '../styles/Login/LoginFormCustom.css'; // Import a new CSS file for custom styles

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermsChange = (e) => {
    setTermsChecked(e.target.checked);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!termsChecked) {
      setErrorMessage("Please accept the terms and conditions to log in.");
      return;
    }

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

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      alert(`✅ Login successful! Redirecting to ${redirectUrl}...`);
      navigate(redirectUrl);

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
        <FormCheck
          type="checkbox"
          id="termsAndConditions"
          label="I agree to the Terms and Conditions"
          checked={termsChecked}
          onChange={handleTermsChange}
          required
          className="custom-checkbox" 
        />
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100 gradient-btn" disabled={!termsChecked}>
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