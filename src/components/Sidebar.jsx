import React from "react";
import { FaHome, FaTint, FaCogs, FaHistory, FaPowerOff, FaPlus } from "react-icons/fa";
import "../components/sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Top Menu */}
      <div className="menu">
        <div className="menu-item active">
          <FaHome className="icon" />
          <span>Homescreen</span>
          <div className="active-indicator"></div>
        </div>
        <div className="menu-item">
          <FaTint className="icon" />
          <span>Water set</span>
        </div>
        <div className="menu-item">
          <FaCogs className="icon" />
          <span>Managment</span>
        </div>
        <div className="menu-item">
          <FaHistory className="icon" />
          <span>History</span>
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
        <div className="menu-item">
          <FaPowerOff className="icon" />
          <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;