import React from "react";
import { Container, Card } from "react-bootstrap";
import LoginForm from "../components/LoginForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/Login.css";

const Login = () => {
  return (
    <div className="signup-container">
      <Container className="d-flex justify-content-center align-items-center p-5">
          <Card.Body>
            <h2 className="text-white text-left">Login</h2>
            <p className="text-white text-left">Glad you're back!</p>

            <LoginForm /> {/* Uses new component */}
            
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1 text-white" />
              <span className="mx-2 text-white">Or</span>
              <hr className="flex-grow-1 text-white" />
            </div>
            
            <SocialLogin /> {/* Uses new component */}
            
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

export default Login;
