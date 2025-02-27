import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import "../styles/navbar.css";
import axios from "axios";

const Navbar = ({ theme, toggleTheme }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:5000/api/users/1"); // Adjust with a valid user ID
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data.");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={`navbar ${theme}`}>
      <div className="left-section">
        <div className="account-info">
          <div className="account-icon">
            <img src="/aquasense/src/assets/drei.jpg" className="w-6 h-6" />
          </div>
          <div className="account-details">
            <p className="account-name">{user ? user.username : "Loading..."}</p>
            <p className="account-email">{user ? user.email : "Loading..."}</p>
          </div>
          <IoMdArrowDropdown className="dropdown-icon" />
        </div>
      </div>

      <div className="right-section">
        <FaBell className="notification-icon" />
        <button className="admin-button">Admin</button>
        <div className="profile-pic">
          <img src="/aquasense/src/assets/drei.jpg" className="w-full h-full object-cover" />
        </div>
        <IoMdArrowDropdown className="dropdown-icon" />
      </div>
    </div>
  );
};

export default Navbar;
