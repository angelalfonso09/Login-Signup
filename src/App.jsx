import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccountManagement from "./pages/AccountManagement";
import Water from "./pages/Water";
import History from "./pages/History";
import AdminDB from "./pages/adminDB";
import UserDB from "./pages/userDB";

import "./styles/common/App.css";

import "./components/ForgotPasswordForm";
import "./components/LoginForm";
import "./components/SignupForm";
import "./components/SocialLogin";
import "./components/Navbar";
import "./components/AdminAccountForm";
import "./components/Meter";
import "./components/AccountTable";

function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem("theme") || "dark");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  console.log("Theme changed to:", theme);

  // Function to get user role from localStorage
  const getUserRole = () => localStorage.getItem("userRole");

  // Protected Route Wrapper
  const ProtectedRoute = ({ element, allowedRoles }) => {
    const userRole = getUserRole();

    if (!userRole) return <Navigate to="/login" replace />; 
    if (!allowedRoles.includes(userRole)) return <Navigate to="/" replace />; 

    return element;
  };

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Routes>
          <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/signup" element={<Signup theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/forgotpassword" element={<ForgotPassword theme={theme} toggleTheme={toggleTheme} />} />

          {/* Role-Based Routing for Dashboards */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} allowedRoles={["Super Admin"]} />}
          />
          <Route
            path="/adminDB"
            element={<ProtectedRoute element={<AdminDB theme={theme} toggleTheme={toggleTheme} />} allowedRoles={["Admin"]} />}
          />
          <Route
            path="/userDB"
            element={<ProtectedRoute element={<UserDB theme={theme} toggleTheme={toggleTheme} />} allowedRoles={["User"]} />}
          />

          {/* Other Routes */}
          <Route
            path="/accountmanagement"
            element={<ProtectedRoute element={<AccountManagement theme={theme} toggleTheme={toggleTheme} />} allowedRoles={["Super Admin"]} />}
          />
          <Route
            path="/history"
            element={<ProtectedRoute element={<History theme={theme} toggleTheme={toggleTheme} />} allowedRoles={["Super Admin", "User" , "Admin"]} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
