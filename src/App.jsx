import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Signup.css";
import "./styles/Login.css";
import "./styles/ForgotPassword.css";

import "./components/ForgotPasswordForm"
import "./components/LoginForm"
import "./components/SignupForm"
import "./components/SocialLogin"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;