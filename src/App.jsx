import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccountManagement from "./pages/AccountManagement";

import "./components/ForgotPasswordForm"
import "./components/LoginForm"
import "./components/SignupForm"
import "./components/SocialLogin"
import "./components/Navbar"
import "./components/AdminAccountForm"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accountmanagement" element={<AccountManagement />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
       
      </Routes>
    </Router>
  );
}


export default App;