import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
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
import UserNotif from "./pages/UserNotif";     
import AdminNotif from "./pages/AdminNotif"; 
import SettingsPage from "./pages/Settings";   
import UserSettingsPage from "./pages/UserSettings";    

import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import "./styles/common/App.css";
import "./styles/theme.css";

// Protected Route Wrapper
const ProtectedRoute = ({ element, allowedRoles }) => {
    const navigate = useNavigate();

    const userRole = localStorage.getItem("userRole");
    let currentUser = null;
    const userString = localStorage.getItem('user');

    if (userString && userString !== "undefined" && userString !== "null") {
        try {
            currentUser = JSON.parse(userString);
        } catch (e) {
            console.error("Error parsing user from localStorage in ProtectedRoute:", e);
        }
    }
    const isUserVerified = currentUser ? currentUser.isVerified === true : false;

    useEffect(() => {
        if (window.location.pathname === "/userDB" && userRole === "User" && !isUserVerified) {
            localStorage.setItem('showAccessModalOnLoad', 'true');
            console.log("ProtectedRoute: Set showAccessModalOnLoad for unverified User navigating to /userDB.");
        } else {
            localStorage.removeItem('showAccessModalOnLoad');
            console.log("ProtectedRoute: Cleared showAccessModalOnLoad.");
        }
    }, [userRole, isUserVerified, window.location.pathname]);

    if (!userRole) {
        console.log("ProtectedRoute: No userRole found, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        console.log(`ProtectedRoute: User role '${userRole}' not allowed for this route. Allowed: ${allowedRoles.join(', ')}`);

        if (userRole === "User") {
            console.log("ProtectedRoute: User role trying to access restricted page, redirecting to /userDB.");
            return <Navigate to="/userDB" replace />;
        } else if (userRole === "Admin") {
            console.log("ProtectedRoute: Admin role trying to access restricted page, redirecting to /adminDB.");
            return <Navigate to="/adminDB" replace />;
        }
        else {
            console.log("ProtectedRoute: Unrecognized role trying to access a restricted page, redirecting to /login.");
            return <Navigate to="/login" replace />;
        }
    }

    console.log(`ProtectedRoute: User role '${userRole}' is allowed for this route. Rendering element.`);
    return element;
};

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
                    <Route path="/userDB" element={<ProtectedRoute element={<UserDB />} allowedRoles={["User"]} />} />
                    <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["Super Admin"]} />} />
                    <Route path="/adminDB" element={<ProtectedRoute element={<AdminDB />} allowedRoles={["Admin"]} />} />
                    <Route path="/accountmanagement" element={<ProtectedRoute element={<AccountManagement />} allowedRoles={["Super Admin"]} />} />
                    <Route path="/history" element={<ProtectedRoute element={<History />} allowedRoles={["Super Admin", "User", "Admin"]} />} />
                    <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} allowedRoles={["Super Admin", "Admin"]} />} />
                    <Route path="/user-settings" element={<ProtectedRoute element={<UserSettingsPage />} allowedRoles={["User"]} />} />
                    
                    {/* Notification Routes for each role */}
                    {/* Super Admin Notifications */}
                    <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} allowedRoles={["Super Admin"]} />} />
                    {/* User Notifications */}
                    <Route path="/usernotif" element={<ProtectedRoute element={<UserNotif />} allowedRoles={["User"]} />} />
                    {/* Admin Notifications */}
                    <Route path="/adminnotif" element={<ProtectedRoute element={<AdminNotif />} allowedRoles={["Admin"]} />} />

                    {/* Redirect any unmatched routes to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
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