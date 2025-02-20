import React from "react";
import { Container, Card } from "react-bootstrap";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import "../styles/ForgotPassword/ForgotPassword.css";
import BackgroundLayout from '../components/BackgroundLayout';


const ForgotPassword = () => {
  return (
    <BackgroundLayout variant="pink">
    <div className="forgot-password-container">
      <Container className="forgot-password-wrapper d-flex justify-content-center align-items-center p-5">
        <Card.Body>
          <h2 className="forgot-password-title text-white text-left">Forgot Password?</h2>
          <p className="forgot-password-description text-white text-left">Please enter your email.</p>

          <ForgotPasswordForm />

          <div className="forgot-password-footer text-center mt-3">
            <p className="forgot-password-login text-white">
              Don't have an account? <a href="/signup" className="forgot-password-link text-white">Signup</a>
            </p>
          </div>
          <div className="forgot-password-links text-center text-muted small">
            <a href="#" className="forgot-password-terms">Terms & Conditions</a> | 
            <a href="#" className="forgot-password-support">Support</a> | 
            <a href="#" className="forgot-password-care">Customer Care</a>
          </div>
        </Card.Body>
      </Container>
    </div>
    </BackgroundLayout>
  );
};

export default ForgotPassword;
