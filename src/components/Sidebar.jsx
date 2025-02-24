import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import for navigation & active tracking
import { FaHome, FaTint, FaCogs, FaHistory, FaPowerOff, FaPlus } from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get the current route

  return (
    <div className="sidebar">
      {/* Top Menu */}
      <div className="menu">
        <div
          className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <FaHome className="icon" />
          <span>Homescreen</span>
          {location.pathname === "/dashboard" && <div className="active-indicator"></div>}
        </div>

        <div
          className={`menu-item ${location.pathname === "/water" ? "active" : ""}`}
          onClick={() => navigate("/water")}
        >
          <FaTint className="icon" />
          <span>Water set</span>
          {location.pathname === "/water" && <div className="active-indicator"></div>}
        </div>

        <div
          className={`menu-item ${location.pathname === "/accountmanagement" ? "active" : ""}`}
          onClick={() => navigate("/accountmanagement")}
        >
          <FaCogs className="icon" />
          <span>Management</span>
          {location.pathname === "/accountmanagement" && <div className="active-indicator"></div>}
        </div>

        <div
          className={`menu-item ${location.pathname === "/history" ? "active" : ""}`}
          onClick={() => navigate("/history")}
        >
          <FaHistory className="icon" />
          <span>History</span>
          {location.pathname === "/history" && <div className="active-indicator"></div>}
        </div>
      </div>

      {/* Integrations */}
      <div className="integrations">
        <p className="section-title">INTEGRATIONS</p>
        <div className="menu-item">
          <span>Alexias</span>
        </div>
        <div className="menu-item">
          <FaPlus className="icon" />
          <span>Add new plugin</span>
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
