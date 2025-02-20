import React from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import '../styles/Login/LoginForm.css'; // Correct the CSS file path

const LoginForm = () => {
  const navigate = useNavigate(); // Initialize navigation function

  const handleLogin = (e) => {
    e.preventDefault();
    // Add authentication logic here if needed
    navigate("/dashboard"); // Redirect to Dashboard after clicking login
  };

  return (
    <Form onSubmit={handleLogin}> {/* Attach onSubmit event */}
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Username" className="input-field transparent-input" required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="password" placeholder="Password" className="input-field transparent-input" required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Remember me" className="text-white" />
      </Form.Group>
      <Button type="submit" variant="primary" className="w-100 gradient-btn">Login</Button> {/* Submit button */}
      <div className="text-center mt-3">
        <a href="/forgotpassword" className="text-white">Forgot Password?</a>
      </div>
    </Form>
  );
};

export default LoginForm;
