
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCogs, FaHistory, FaPowerOff, FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext
import "../styles/Components Css/Sidebar.css";
import "../styles/theme.css";
import { FaBell, FaGears } from 'react-icons/fa6';

const Sidebar = () => {
  console.log("Sidebar component has rendered!");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext); // Use theme context
  const userRole = localStorage.getItem("userRole"); // Get user role from local storage
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [username, setUsername] = useState("");

  useEffect(() => {
    console.log("Sidebar: Token in useEffect:", token);
    let isMounted = true; // Add a flag to prevent setting state on unmounted components

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Frontend: Data received from /api/auth/user:", data);
          if (isMounted && data && data.username) { // Check if component is mounted and data/username exist
            setUsername(data.username);
            console.log("Frontend: Username state updated to:", data.username);
          } else if (!data?.username) {
            console.warn("Frontend: Username not found in fetched data.");
          }
        } else {
          console.error("Frontend: Failed to fetch user data", response.status);
          // Optionally handle error states here (e.g., set username to "Guest")
        }
      } catch (error) {
        console.error("Frontend: Error fetching user data:", error);
        // Optionally handle error states here
      }
    };

    if (token) {
      fetchUserData();
    } else {
      console.log("Sidebar: No token available.");
      setUsername(""); // Reset username if no token
    }

    return () => {
      isMounted = false; // Cleanup function to set the flag when the component unmounts
    };
  }, [token]);

  return (
    <div className={`sidebar ${theme}`}>
      <div className="menu">

        {/* Dashboard (Visible to all roles) */}
        <div className="User">
        {/* <h1>Welcome, {username}</h1> */}
          <h2>Welcome! </h2>
          <h4>{userRole}</h4>
        </div>

        {/* Dashboard (Visible to all roles) */}
        <div className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
          <FaHome className="icon" />
          <span>Dashboard</span>
        </div>

        {/* Account Management (Only for Super Admin) */}
        {userRole === "Super Admin" && (
          <div className={`menu-item ${location.pathname === "/accountmanagement" ? "active" : ""}`} onClick={() => navigate("/accountmanagement")}>
            <FaCogs className="icon" />
            <span>Management</span>
          </div>
        )}

        {/* History (Visible to all roles) */}
        <div className={`menu-item ${location.pathname === "/history" ? "active" : ""}`} onClick={() => navigate("/history")}>
          <FaHistory className="icon" />
          <span>History</span>
        </div>

        <div className={`menu-item ${location.pathname === "/notifications" ? "active" : ""}`} onClick={() => navigate("/notifications")}>
          <FaBell className="icon" />
          <span>Notifiactions</span>
        </div>

        {/* Theme Toggle */}
        <div className="menu-item theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <FaSun className="icon" /> : <FaMoon className="icon" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </div>
      </div>

      {/* Logout */}
      <div className="logout">

      <div className="menu-item" onClick={() => navigate("/")}>
          <FaGears className="icon" />
          <span>Settings</span>
        </div>

        <div className="menu-item" onClick={() => navigate("/")}>
          <FaPowerOff className="icon" />
          <span>Log out</span>
        </div>


      </div>
    </div>
  );
};

export default Sidebar;
