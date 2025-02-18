import React from "react";
import { Container, Card } from "react-bootstrap";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  return (
    <div className="signup-container">
      <Container className="d-flex justify-content-center align-items-center p-5">
          <Card.Body>
            <h2 className="text-white text-left">Forgot Password?</h2>
            <p className="text-white text-left">Please enter your email.</p>

            <ForgotPasswordForm /> {/* Uses new component */}
            
            
            <div className="text-center mt-3">
                <p className="text-white">
                Don't have an account? <a href="/signup" className="text-white">Login</a>
                </p>
            </div>
            <div className="text-center text-muted small">
                <a href="#">Terms & Conditions</a> | <a href="#">Support</a> | <a href="#">Customer Care</a>
            </div>
        </Card.Body>
      </Container>
    </div>
  );
};

export default ForgotPassword;
