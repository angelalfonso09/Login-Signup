import React from "react";
import { Form, Button } from "react-bootstrap";
import '../styles/ForgotPasswordForm.css'; // Correct the CSS file path

const LoginForm = () => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Username" className="input-field transparent-input" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="password" placeholder="Password" className="input-field transparent-input" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Remember me" className="text-white" />
      </Form.Group>
      <Button variant="primary" className="w-100 gradient-btn">Login</Button>
      <div className="text-center mt-3">
        <a href="/forgotpassword" className="text-white">Forgot Password?</a>
      </div>
    </Form>
  );
};

export default LoginForm;
