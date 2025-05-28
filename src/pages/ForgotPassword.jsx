import React, { useState, useContext } from "react";
import { Container, Card, Modal } from "react-bootstrap";
import "../styles/ForgotPassword/ForgotPassword.css";
import BackgroundLayout from '../components/BackgroundLayout';
import { ThemeContext } from '../context/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme } = useContext(ThemeContext); // Destructure theme from context

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setStatus({
        type: 'success',
        message: data.message
      });

      setOtpSent(true);
      setShowOtpModal(true);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/validate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setStatus({
        type: 'success',
        message: 'OTP verified successfully. Proceed to reset your password.'
      });

      setShowOtpModal(false);
      setOtp('');
      setShowResetModal(true);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Invalid OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: "Passwords don't match." });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setStatus({ type: 'success', message: 'Password reset successful! You can now log in.' });
      setShowResetModal(false);
      alert('Password reset successful! Redirecting to login...');
      window.location.href = '/login'; // redirect to login page
    } catch (error) {
      setStatus({ type: 'error', message: 'Password reset failed. Please try again.' });
    } finally {
      setIsLoading(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <BackgroundLayout variant="pink">
      {/* Apply theme to the main container or card that wraps content */}
      <div className={`forgot-password-container ${theme}`}>
        <Container className="forgot-password-wrapper d-flex justify-content-center align-items-center p-5">
          {/* Apply theme to Card.Body and other relevant elements */}
          <Card.Body className={`forgot-password-card-body ${theme}`}>
            <h2 className="forgot-password-title text-left">Forgot Password?</h2> {/* Remove text-white if theme handles color */}
            <p className="forgot-password-description text-left">Please enter your email.</p> {/* Remove text-white if theme handles color */}

            <form onSubmit={handleSubmitEmail}>
              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // className="form-control forgot-password-input" // Add a unique class for main form input
                  placeholder="Enter your email"
                  required
                  className={`input-field ${theme}`}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 forgot-password-button" // Add a unique class for main form button
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              {status.message && (
                <div className={`alert mt-3 ${status.type === 'success' ? 'alert-success' : 'alert-danger'} forgot-password-status-message`}>
                  {status.message}
                </div>
              )}
            </form>

            <div className="forgot-password-footer text-center mt-3">
              <p className="forgot-password-login"> {/* Remove text-white if theme handles color */}
                Don't have an account? <a href="/signup" className="forgot-password-link">Signup</a> {/* Remove text-white if theme handles color */}
              </p>
            </div>

          </Card.Body>
        </Container>
      </div>

      {/* OTP Verification Modal */}
      {/* Apply theme to the Modal directly */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered className={`otp-verification-modal ${theme}`}>
        <Modal.Header  className="otp-modal-header">
          <Modal.Title className="otp-modal-title">OTP Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body className="otp-modal-body">
          <p className="otp-modal-description">Enter the verification code we just sent to your email address.</p>
          <form onSubmit={handleSubmitOtp}>
            <div className="mb-3">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`input-field ${theme}`}
                placeholder="Enter 6-digit code"
                maxLength="6" 
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 otp-verify-button"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>
            {status.message && (
              <div className={`alert mt-3 ${status.type === 'success' ? 'alert-success' : 'alert-danger'} otp-status-message`}>
                {status.message}
              </div>
            )}
            <div className="resend-otp-section mt-3 text-center">
              <p>Didn't receive code? <a href="#" className="resend-otp-link">Resend</a></p>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Reset Password Modal */}
      {/* Apply theme to the Modal directly */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered className={`reset-password-modal ${theme}`}>
        <Modal.Header closeButton className="reset-modal-header">
          <Modal.Title className="reset-modal-title">Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="reset-modal-body">
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <input
                type="password"
                className={`input-field ${theme}`}// Add unique class for reset input
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className={`input-field ${theme}`} // Add unique class for reset input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100 reset-password-button" // Add unique class for reset button
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            {status.message && (
              <div className={`alert mt-3 ${status.type === 'success' ? 'alert-success' : 'alert-danger'} reset-status-message`}>
                {status.message}
              </div>
            )}
          </form>
        </Modal.Body>
      </Modal>
    </BackgroundLayout>
  );
};

export default ForgotPassword;