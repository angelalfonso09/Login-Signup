import React from "react";
import { Form, Button } from "react-bootstrap";
import '../styles/SignupForm.css'; // Correct the CSS file path

const SignupForm = () => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Username" className="input-field transparent-input" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="email" placeholder="Email / Phone" className="input-field transparent-input" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="password" placeholder="Password" className="input-field transparent-input" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control type="password" placeholder="Confirm Password" className="input-field transparent-input" />
      </Form.Group>
      <Button variant="primary" className="w-100 gradient-btn">Sign Up</Button>
    </Form>
  );
};

export default SignupForm;
