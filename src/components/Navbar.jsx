import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import "../styles/navbar.css";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext"; 

const Navbar = () => {
  const { theme } = useContext(ThemeContext); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token being sent:", token); // Debugging
  
        if (!token) throw new Error("No authentication token found");
  
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
  
        console.log("User data received:", response.data); // Debugging
  
        if (response.data) {
          setUser(response.data);
        } else {
          throw new Error("User data is empty.");
        }
      } catch (err) {
        console.error(`❌ Error fetching user: ${err.response ? err.response.data : err.message}`);
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