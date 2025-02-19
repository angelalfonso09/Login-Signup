import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Signup.css";
import "./styles/Login.css";
import "./styles/ForgotPassword.css";


import "./components/ForgotPasswordForm"
import "./components/LoginForm"
import "./components/SignupForm"
import "./components/SocialLogin"
import "./components/bgCircle"
import "./components/Navbar"

const Layout = ({ children }) => {
  const location = useLocation();
  const showCircles = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {showCircles && <BgCircle />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}


export default App;