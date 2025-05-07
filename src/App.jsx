import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccountManagement from "./pages/AccountManagement";
import History from "./pages/History";
import AdminDB from "./pages/adminDB";
import UserDB from "./pages/userDB";
import Notifications from "./pages/Notifications";

import { ThemeProvider, ThemeContext } from "./context/ThemeContext"; // Import ThemeContext
import "./styles/common/App.css";
import "./styles/theme.css";

// Protected Route Wrapper
const ProtectedRoute = ({ element, allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");

  if (!userRole) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(userRole)) return <Navigate to={userRole === "Super Admin" ? "/dashboard" : userRole === "Admin" ? "/adminDB" : "/userDB"} replace />;

  return element;
};

// App Wrapper to Use ThemeContext
const ThemedApp = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`app-container ${theme}`}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Role-Based Routing for Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["Super Admin"]} />} />
          <Route path="/adminDB" element={<ProtectedRoute element={<AdminDB />} allowedRoles={["Admin"]} />} />
          <Route path="/userDB" element={<ProtectedRoute element={<UserDB />} allowedRoles={["User"]} />} />

          {/* Other Routes */}
          <Route path="/accountmanagement" element={<ProtectedRoute element={<AccountManagement />} allowedRoles={["Super Admin"]} />} />
          <Route path="/history" element={<ProtectedRoute element={<History />} allowedRoles={["Super Admin", "User", "Admin"]} />} />
          <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} allowedRoles={["Super Admin", "User", "Admin"]} />} />
        </Routes>
      </Router>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
