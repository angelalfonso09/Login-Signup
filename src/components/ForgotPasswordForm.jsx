import React from "react";
import { Form, Button } from "react-bootstrap";
import '../styles/ForgotPassword/ForgotPasswordForm.css'; // Correct the CSS file path

const ForgotPasswordForm = () => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Control type="text" placeholder="Username" className="input-field transparent-input" />
      </Form.Group>
      <Button variant="primary" className="w-100 gradient-btn">Reset Password</Button>
    </Form>
  );
};

export default ForgotPasswordForm;
