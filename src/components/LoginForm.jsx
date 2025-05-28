import React, { useState } from "react";
import { Form, Button, FormCheck } from "react-bootstrap";
import axios from "axios";
import '../styles/Login/LoginForm.css';
import '../styles/Login/LoginFormCustom.css'; // Make sure this CSS also handles theme if needed
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

const LoginForm = ({ onLoginSuccess, onLoginFailure, termsChecked, setTermsChecked, loginError }) => {
  const { theme } = useTheme(); // Use the theme from the ThemeContext
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    onLoginFailure("");

    if (!termsChecked) {
      onLoginFailure("Please accept the terms and conditions to log in.");
      return;
    }

    if (!formData.username || !formData.password) {
      onLoginFailure("All fields are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/login", formData, {
        headers: { "Content-Type": "application/json" }
      });

      const { user, token, role } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      onLoginSuccess(role);

    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      onLoginFailure(error.response?.data?.error || "Login failed. Try again.");
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="username"
          placeholder="Username"
          className={`input-field ${theme}`} // Apply theme class
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
          className={`input-field ${theme}`} // Apply theme class
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <FormCheck
          type="checkbox"
          id="termsAndConditions"
          label={
            <span className={`form-check-label ${theme}`}>
              I agree to the Terms and Conditions
            </span>
          } // Apply theme class to the label text
          checked={termsChecked}
          onChange={(e) => setTermsChecked(e.target.checked)}
          required
          // Consider adding a custom-checkbox class and theme class if you're heavily styling the checkbox itself
          // className={`custom-checkbox ${theme}`}
        />
      </Form.Group>

      <Button type="submit" variant="primary" className="gradient-btn " disabled={!termsChecked}>
        Login
      </Button>

      {loginError && (
        <p className={`mt-3 text-center ${theme === 'dark' ? 'text-danger-dark' : 'text-danger'}`}>
          {loginError}
        </p>
      )}

      <div className="text-center mt-3">
        <a href="/forgotpassword" className={theme === 'dark' ? 'text-white' : 'text-primary'}>Forgot Password?</a>
      </div>
    </Form>
  );
};

export default LoginForm;