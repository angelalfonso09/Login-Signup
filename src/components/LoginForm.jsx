import React, { useState, useContext } from "react"; // Import useContext
import { Form, Button, FormCheck } from "react-bootstrap";
import axios from "axios";
import '../styles/Login/LoginForm.css';
import '../styles/Login/LoginFormCustom.css';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginForm = ({ onLoginSuccess, onLoginFailure, termsChecked, setTermsChecked, loginError }) => {
  const { theme } = useTheme();
  const { login } = useContext(AuthContext); // Destructure the login function from AuthContext

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

      // *** THIS IS THE KEY CHANGE ***
      // Instead of directly setting localStorage, call the login function from AuthContext
      // The user object received from the backend is the userData needed by AuthContext.
      login(user, token); // Pass the user object and the token

      // localStorage.setItem("user", JSON.stringify(user)); // Remove or comment out this line
      // localStorage.setItem("token", token);             // AuthContext handles this
      // localStorage.setItem("userRole", role);           // AuthContext handles this if user object contains role

      // Your onLoginSuccess might need to be adjusted depending on how you use it.
      // If it's just for navigation, it can remain.
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
          className={`input-field ${theme}`}
          value={formData.username}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* Password Field - Modified to include the eye icon */}
      <Form.Group className="mb-3 password-input-container">
        <Form.Control
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          className={`input-field ${theme} password-with-icon`}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span
          className={`password-toggle-icon ${theme}`}
          onClick={togglePasswordVisibility}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
      </Form.Group>

      <Form.Group className="mb-3">
        <FormCheck
          type="checkbox"
          id="termsAndConditions"
          label={
            <span className={`form-check-label ${theme}`}>
              I agree to the Terms and Conditions
            </span>
          }
          checked={termsChecked}
          onChange={(e) => setTermsChecked(e.target.checked)}
          required
        />
      </Form.Group>

      <Button type="submit" variant="primary" className="gradient-button-login " disabled={!termsChecked}>
        Login
      </Button>

      {loginError && (
        <p className='danger'>
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