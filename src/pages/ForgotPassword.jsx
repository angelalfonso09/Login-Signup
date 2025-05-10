import React, { useState } from "react";
import { Container, Card } from "react-bootstrap";
import "../styles/ForgotPassword/ForgotPassword.css";
import BackgroundLayout from '../components/BackgroundLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setStatus({
        type: 'success',
        message: data.message
      });
      setEmail('');      
      
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If successful
      setStatus({
        type: 'success',
        message: 'Password reset link has been sent to your email!'
      });
      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send reset link. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundLayout variant="pink">
      <div className="forgot-password-container">
        <Container className="forgot-password-wrapper d-flex justify-content-center align-items-center p-5">
          <Card.Body>
            <h2 className="forgot-password-title text-white text-left">Forgot Password?</h2>
            <p className="forgot-password-description text-white text-left">Please enter your email.</p>

            <form onSubmit={handleSubmit}>
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
                {isLoading ? 'Sending...' : 'Reset Password'}
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
    </BackgroundLayout>
  );
};

export default ForgotPassword;