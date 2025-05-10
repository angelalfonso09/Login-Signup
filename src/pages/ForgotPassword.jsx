import React, { useState } from "react";
import { Container, Card, Modal } from "react-bootstrap";
import "../styles/ForgotPassword/ForgotPassword.css";
import BackgroundLayout from '../components/BackgroundLayout';

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
      <div className="forgot-password-container">
        <Container className="forgot-password-wrapper d-flex justify-content-center align-items-center p-5">
          <Card.Body>
            <h2 className="forgot-password-title text-white text-left">Forgot Password?</h2>
            <p className="forgot-password-description text-white text-left">Please enter your email.</p>

            <form onSubmit={handleSubmitEmail}>
              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              {status.message && (
                <div className={`alert mt-3 ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                  {status.message}
                </div>
              )}
            </form>

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

      {/* OTP Verification Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitOtp}>
            <div className="mb-3">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-control"
                placeholder="Enter OTP"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-success w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </BackgroundLayout>
  );
};

export default ForgotPassword;
