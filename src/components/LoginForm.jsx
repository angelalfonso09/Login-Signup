import React, { useState } from "react";
import { Form, Button, FormCheck } from "react-bootstrap";
// Removed: import { useNavigate } from "react-router-dom"; // Navigation is now handled by the parent Login component
import axios from "axios";
import '../styles/Login/LoginForm.css';
import '../styles/Login/LoginFormCustom.css';

// LoginForm now accepts props for handling login success/failure and terms & conditions state
const LoginForm = ({ onLoginSuccess, onLoginFailure, termsChecked, setTermsChecked, loginError }) => {
  // Removed: const navigate = useNavigate(); // Navigation is handled by parent
  const [formData, setFormData] = useState({ username: "", password: "" });
  // Removed: const [errorMessage, setErrorMessage] = useState(""); // Error message is now passed as a prop from parent

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Removed: const handleTermsChange = (e) => { // This function is no longer needed here
  //   setTermsChecked(e.target.checked);        // as setTermsChecked is passed directly
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Clear any previous error message before attempting login
    onLoginFailure(""); // Use the prop to clear error in parent

    if (!termsChecked) {
      onLoginFailure("Please accept the terms and conditions to log in."); // Use the prop to set error in parent
      return;
    }

    console.log("Form Data Before Sending:", formData);

    if (!formData.username || !formData.password) {
      onLoginFailure("All fields are required"); // Use the prop to set error in parent
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/login", formData, {
        headers: { "Content-Type": "application/json" }
      });

      const { user, token, role, redirectUrl } = response.data; // Keep redirectUrl if your backend sends it, though parent handles navigation

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      // Call the onLoginSuccess prop with the user's role
      // The parent Login component will now handle the alert and navigation based on the role
      onLoginSuccess(role);

    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      // Call the onLoginFailure prop to pass the error message to the parent
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
          checked={termsChecked} // Use the termsChecked prop
          onChange={(e) => setTermsChecked(e.target.checked)} // Use the setTermsChecked prop
          required
          className="custom-checkbox"
        />
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100 gradient-btn" disabled={!termsChecked}>
        Login
      </Button>

      {/* Display error message passed from the parent Login component */}
      {loginError && <p className="mt-3 text-center text-danger">{loginError}</p>}

      <div className="text-center mt-3">
        <a href="/forgotpassword" className="text-white">Forgot Password?</a>
      </div>
    </Form>
  );
};

export default LoginForm;
