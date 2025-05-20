import React, { useState } from "react";
import { Container, Card, Modal, Form, Button } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/Login/Login.css";
import BackgroundLayout from '../components/BackgroundLayout';

const Login = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleCloseTermsModal = () => setShowTermsModal(false);
  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleTermsCheckboxChange = (e) => setTermsChecked(e.target.checked);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (!termsChecked) {
      setLoginError("Please accept the terms and conditions.");
      return;
    }
    // Proceed with login logic here (you might need to pass this down to LoginForm)
    // For now, let's just log a message
    console.log("Login submitted with terms accepted!");
    setLoginError(""); // Clear any previous error
    // You would typically call your authentication function here
  };

  return (
    <BackgroundLayout variant="purple">
      <div className="login-container">
        <Container className="login-container-inner d-flex justify-content-center align-items-center p-5">
          <Card.Body className="login-card-body">
            <h2 className="login-title text-white text-left">Login</h2>
            <p className="login-subtitle text-white text-left">Glad you're back!</p>

            {/* Pass the handleLoginSubmit and termsChecked state down to LoginForm */}
            <LoginForm onSubmit={handleLoginSubmit} termsChecked={termsChecked} setTermsChecked={setTermsChecked} loginError={loginError} />

            <div className="login-divider d-flex align-items-center my-3">
              <hr className="login-hr flex-grow-1 text-white" />
              <span className="login-or-text mx-2 text-white">Or</span>
              <hr className="login-hr flex-grow-1 text-white" />
            </div>

            <SocialLogin />

            <div className="login-signup-link text-center mt-3">
              <p className="login-signup-text text-white">
                Don't have an account? <a href="/signup" className="login-signup-link-text text-white">Signup</a>
              </p>
            </div>
            <div className="login-footer text-center text-muted small">
              <a href="#" className="login-footer-link" onClick={handleShowTermsModal}>Terms & Conditions</a> 
              {/* | <a href="#" className="login-footer-link">Support</a> | <a href="#" className="login-footer-link">Customer Care</a> */}
            </div>
          </Card.Body>
        </Container>
      </div>

      <Modal show={showTermsModal} onHide={handleCloseTermsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
<Modal.Body style={{ maxHeight: '800px', overflowY: 'scroll', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <p>These terms and conditions ("Terms") govern your use of [Your Website/Application Name]. By accessing or using our services, you agree to be bound by these Terms. Please read them carefully.</p>
          <p><strong>1. Acceptance of Terms</strong></p>
          <p>By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
          <p><strong>2. User Accounts</strong></p>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          <p><strong>3. Use of Services</strong></p>
          <p>You agree to use our services only for lawful purposes and in a manner that does not infringe the rights of or restrict or inhibit anyone else's use and enjoyment of our services.</p>
          <p><strong>4. Privacy Policy</strong></p>
          <p>Your use of our services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding your personal information.</p>
          <p><strong>5. Intellectual Property</strong></p>
          <p>The content, trademarks, service marks, and logos on our services are owned by or licensed to us and are subject to copyright and other intellectual property rights.</p>
          <p><strong>6. Disclaimer of Warranties</strong></p>
          <p>Our services are provided on an "as is" and "as available" basis without any warranties of any kind, express or implied.</p>
          <p><strong>7. Limitation of Liability</strong></p>
          <p>To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services.</p>
          <p><strong>8. Governing Law</strong></p>
          <p>These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
          <p><strong>9. Changes to Terms</strong></p>
          <p>We reserve the right to modify or revise these Terms at any time. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.</p>
          <p><strong>10. Contact Us</strong></p>
          <p>If you have any questions about these Terms, please contact us at [Your Contact Information].</p>
          {/* Add more terms and conditions content here */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTermsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </BackgroundLayout>
  );
};

export default Login;