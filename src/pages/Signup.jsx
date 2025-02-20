import React from "react";
import { Container, Card } from "react-bootstrap";
import { Link } from "react-router-dom";  // Import Link from react-router-dom
import SignupForm from "../components/SignupForm";
import SocialLogin from "../components/SocialLogin";
import "../styles/Signup/Signup.css";
import BackgroundLayout from '../components/BackgroundLayout';

const Signup = () => {
  return (
    <BackgroundLayout variant="blue">
    <div className="signup-container">
      <Container className="d-flex justify-content-center align-items-center p-5">
        <Card.Body>
          <h2 className="text-white text-left">Sign Up</h2>
          <p className="text-white text-left">Just some details to get you in!</p>

          <SignupForm /> {/* Uses new component */}
          
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 text-white" />
            <span className="mx-2 text-white">Or</span>
            <hr className="flex-grow-1 text-white" />
          </div>
          
          <SocialLogin /> {/* Uses new component */}
          
          <div className="text-center mt-3">
            <p className="text-white">
              Already Registered?{" "}
              <Link to="/login" className="text-white">Login</Link>
            </p>
          </div>
          <div className="text-center text-muted small">
            <a href="#">Terms & Conditions</a> | <a href="#">Support</a> | <a href="#">Customer Care</a>
          </div>
        </Card.Body>
      </Container>
    </div>
    </BackgroundLayout>
  );
};

export default Signup;
