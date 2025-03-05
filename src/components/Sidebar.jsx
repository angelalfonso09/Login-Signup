import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCogs, FaHistory, FaPowerOff, FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext
import "../styles/Sidebar.css";
import "../styles/theme.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext); // Use theme context
  const userRole = localStorage.getItem("userRole"); // Get user role from local storage

  return (
    <div className={`sidebar ${theme}`}>
      <div className="menu">
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

        {/* Theme Toggle */}
        <div className="menu-item theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <FaSun className="icon" /> : <FaMoon className="icon" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </div>
      </div>

      {/* Logout */}
      <div className="logout">
        <div className="menu-item" onClick={() => navigate("/")}>
          <FaPowerOff className="icon" />
          <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
