import React, { useState } from "react";
import { Container, Card, Modal, Form, Button } from "react-bootstrap";
import LoginForm from "../components/LoginForm"; // Assuming LoginForm handles the actual authentication
import SocialLogin from "../components/SocialLogin";
import "../styles/Login/Login.css";
import BackgroundLayout from '../components/BackgroundLayout';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

const Login = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { theme } = useTheme(); // Use the theme from the ThemeContext

  const handleCloseTermsModal = () => setShowTermsModal(false);
  const handleShowTermsModal = () => setShowTermsModal(true);
  const handleTermsCheckboxChange = (e) => setTermsChecked(e.target.checked);

  /**
   * This function is called by the LoginForm component upon successful authentication.
   * It receives the authenticated user's role and handles navigation and modal flag setting.
   * @param {string} userRole - The role of the successfully logged-in user (e.g., "User", "Admin", "Super Admin").
   */
  const handleLoginSuccess = (userRole) => {
    setLoginError(""); // Clear any previous login errors

    // *** CRITICAL: Set a flag in localStorage if the user role is 'User' ***
    // This flag will be checked by the UserDB component to immediately show the access restricted modal.
    if (userRole === "User") {
      localStorage.setItem("showAccessModalOnLoad", "true");
    }
    // **********************************************************************

    // Navigate the user to their respective dashboard based on their role
    switch (userRole) {
      case "Super Admin":
        navigate("/dashboard", { replace: true }); // Redirect Super Admin to Dashboard
        break;
      case "Admin":
        navigate("/adminDB", { replace: true }); // Redirect Admin to AdminDB
        break;
      case "User":
        navigate("/userDB", { replace: true }); // Redirect User to UserDB
        break;
      default:
        navigate("/", { replace: true }); // Fallback for undefined roles
        break;
    }
  };

  /**
   * This function is called by the LoginForm component upon authentication failure.
   * It updates the login error state to display a message to the user.
   * @param {string} errorMessage - The error message to display.
   */
  const handleLoginFailure = (errorMessage) => {
    setLoginError(errorMessage);
  };

  return (
    <BackgroundLayout variant="purple">
      {/* Apply theme class to the outermost container */}
      <div className={`login-container ${theme}`}>
        <Container className="login-container-inner d-flex justify-content-center align-items-center p-5">
          {/* Apply theme class to the Card.Body */}
          <Card.Body className={`login-card-body ${theme}`}>
            {/* Apply theme-specific text colors */}
            <h2 className={`login-title text-left ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Login</h2>
            <p className={`login-subtitle text-left ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Glad you're back!</p>

            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onLoginFailure={handleLoginFailure}
              termsChecked={termsChecked}
              setTermsChecked={setTermsChecked}
              loginError={loginError} // Pass the error state from Login.jsx
            />

            <div className="login-divider d-flex align-items-center my-3">
              {/* Apply theme-specific hr and text colors */}
              <hr className={`login-hr flex-grow-1 ${theme === 'dark' ? 'text-white' : 'text-dark'}`} />
              <span className={`login-or-text mx-2 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Or</span>
              <hr className={`login-hr flex-grow-1 ${theme === 'dark' ? 'text-white' : 'text-dark'}`} />
            </div>

            <SocialLogin />

            <div className="login-signup-link text-center mt-3">
              {/* Apply theme-specific text colors */}
              <p className={`login-signup-text ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                Don't have an account? <a href="/signup" className={`login-signup-link-text ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>Signup</a>
              </p>
            </div>
            <div className="login-footer text-center small">
              {/* Apply theme-specific link color */}
              <a href="#" className={`login-footer-link ${theme === 'dark' ? 'text-light' : 'text-muted'}`} onClick={handleShowTermsModal}>Terms & Conditions</a>
            </div>
          </Card.Body>
        </Container>
      </div>

      {/* Terms and Conditions Modal - Bootstrap Modals typically handle their own styling well */}
      <Modal show={showTermsModal} onHide={handleCloseTermsModal} centered className={theme}> {/* Apply theme class to the Modal itself */}
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '800px', overflowY: 'scroll', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }} className={theme === 'dark' ? 'bg-secondary text-white' : 'bg-light text-dark'}>
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
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}>
          <Button variant="secondary" onClick={handleCloseTermsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </BackgroundLayout>
  );
};

export default Login;