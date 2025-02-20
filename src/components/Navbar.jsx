import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      {/* Left Section - Account Info and Search Bar */}
      <div className="left-section">
        <div className="account-info">
          <div className="account-icon">
            <img src="/aquasense/src/assets/drei.jpg" className="w-6 h-6" />
          </div>
          <div className="account-details">
            <p className="account-name">Sample account</p>
            <p className="account-email">example@gmail.com</p>
          </div>
          <IoMdArrowDropdown className="dropdown-icon" />
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search quantity control, regulators..."
            className="search-input"
          />
        </div>
      </div>

      {/* Right Section - Notifications and Profile */}
      <div className="right-section">
        <FaBell className="notification-icon" />
        <button className="admin-button">Admin</button>
        <div className="profile-pic">
          <img src="/aquasense/src/assets/drei.jpg"  className="w-full h-full object-cover" />
        </div>
        <IoMdArrowDropdown className="dropdown-icon" />
      </div>
    </div>
  );
};

export default Navbar;