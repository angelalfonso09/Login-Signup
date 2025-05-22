import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import StandbyPage from "./components/StandbPage";

import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import "./styles/common/App.css";
import "./styles/theme.css";

// Protected Route Wrapper
const ProtectedRoute = ({ element, allowedRoles }) => {
    const navigate = useNavigate(); // This hook gives you access to the navigate function

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

    // Use a separate useEffect for the localStorage side effect
    // This effect runs only once when the component mounts, and when userRole or isUserVerified changes.
    // It should NOT contain Navigate calls, as those cause re-renders.
    useEffect(() => {
        if (window.location.pathname === "/userDB" && userRole === "User" && !isUserVerified) {
            localStorage.setItem('showAccessModalOnLoad', 'true');
            console.log("ProtectedRoute: Set showAccessModalOnLoad for unverified User navigating to /userDB.");
        } else {
            localStorage.removeItem('showAccessModalOnLoad');
            console.log("ProtectedRoute: Cleared showAccessModalOnLoad.");
        }
        // This effect's dependencies are important.
        // navigate is not needed here as it doesn't cause a direct side effect.
        // window.location.pathname is an external mutable object, better to avoid if possible,
        // but here it's used for specific logic.
    }, [userRole, isUserVerified, window.location.pathname]); // Added window.location.pathname to dependencies

    // Main authorization logic
    // 1. If no user role, redirect to login
    if (!userRole) {
        console.log("ProtectedRoute: No userRole found, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    // 2. Check if the current user role is NOT in the allowed roles for the given route
    if (!allowedRoles.includes(userRole)) {
        console.log(`ProtectedRoute: User role '${userRole}' not allowed for this route. Allowed: ${allowedRoles.join(', ')}`);

        if (userRole === "User") {
            console.log("ProtectedRoute: User role trying to access restricted page, redirecting to /userDB.");
            return <Navigate to="/userDB" replace />;
        } else if (userRole === "Admin") {
            console.log("ProtectedRoute: Admin role trying to access restricted page, redirecting to /adminDB.");
            return <Navigate to="/adminDB" replace />;
        }
        // FIX for "Unexpected token": Ensure there's always a valid 'else' or no standalone comment.
        // This 'else' block will catch any other unrecognized roles.
        else { // This 'else' likely fixes the syntax error
            console.log("ProtectedRoute: Unrecognized role trying to access a restricted page, redirecting to /login.");
            return <Navigate to="/login" replace />;
        }
    }

    // 3. If all checks pass and the user is allowed to view the element
    console.log(`ProtectedRoute: User role '${userRole}' is allowed for this route. Rendering element.`);
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
                    <Route path="/userDB" element={<ProtectedRoute element={<UserDB />} allowedRoles={["User"]} />} />
                    <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["Super Admin"]} />} />
                    <Route path="/adminDB" element={<ProtectedRoute element={<AdminDB />} allowedRoles={["Admin"]} />} />
                    <Route path="/accountmanagement" element={<ProtectedRoute element={<AccountManagement />} allowedRoles={["Super Admin"]} />} />
                    <Route path="/history" element={<ProtectedRoute element={<History />} allowedRoles={["Super Admin", "User", "Admin"]} />} />
                    <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} allowedRoles={["Super Admin"]} />} />

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