import React from "react";
import { Container, Card } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/Login/Login.css";
import BackgroundLayout from '../components/BackgroundLayout';



const Login = () => {
  return (
    <BackgroundLayout variant="purple">
      <div className="login-container">
        <Container className="login-container-inner d-flex justify-content-center align-items-center p-5">
          <Card.Body className="login-card-body">
            <h2 className="login-title text-white text-left">Login</h2>
            <p className="login-subtitle text-white text-left">Glad you're back!</p>

            <LoginForm /> {/* Uses new component */}
            
            <div className="login-divider d-flex align-items-center my-3">
              <hr className="login-hr flex-grow-1 text-white" />
              <span className="login-or-text mx-2 text-white">Or</span>
              <hr className="login-hr flex-grow-1 text-white" />
            </div>
            
            <SocialLogin /> {/* Uses new component */}
            
            <div className="login-signup-link text-center mt-3">
              <p className="login-signup-text text-white">
                Don't have an account? <a href="/signup" className="login-signup-link-text text-white">Signup</a>
              </p>
            </div>
            <div className="login-footer text-center text-muted small">
              <a href="#" className="login-footer-link">Terms & Conditions</a> | <a href="#" className="login-footer-link">Support</a> | <a href="#" className="login-footer-link">Customer Care</a>
            </div>
          </Card.Body>
        </Container>
      </div>
      </BackgroundLayout>
  );
};

export default Login;