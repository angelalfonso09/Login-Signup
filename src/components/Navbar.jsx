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
        const response = await axios.get("http://localhost:5000/api/auth/users", {
          withCredentials: true, 
        });

        if (response.data) {
          setUser(response.data);
        } else {
          throw new Error("User data is empty.");
        }
      } catch (err) {
        console.error("❌ Error fetching user:", err);
        setError("Failed to load user data.");
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
          <div className="account-details">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : (
              <>
                <p className="account-name">{user?.username || "Unknown User"}</p>
                <p className="account-email">{user?.email || "No Email"}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="right-section">
        <FaBell className="notification-icon" />
        <button className="admin-button">Admin</button>
      </div>
    </div>
  );
};

export default Navbar;
