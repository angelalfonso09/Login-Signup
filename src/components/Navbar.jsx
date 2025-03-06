import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import "../styles/navbar.css";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState(null); // Renamed from 'user' to 'users'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // Fallback for safety

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token being sent:", token);
        console.log(`Backend URL: ${backendURL}`);

        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${backendURL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("✅ User data received:", response.data);
        setUsers(response.data); // Changed 'setUser' to 'setUsers'
      } catch (err) {
        console.error(`❌ Error fetching user:`, err.response ? err.response.data : err.message);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAdminClick = () => {
    alert(`Welcome, ${users?.role}! Redirecting to the admin panel...`);
    if (users?.role === "super_admin") {
      window.location.href = "/super-admin-dashboard";
    } else if (users?.role === "admin") {
      window.location.href = "/admin-dashboard";
    } else {
      alert("You do not have admin privileges.");
    }
  };

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
                <p className="account-name">{users?.username || "Unknown User"}</p>
                <p className="account-email">{users?.email || "No Email"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="right-section">
        <FaBell className="notification-icon" />
        {users?.role === "super_admin" && (
          <button className="super-admin-button" onClick={handleAdminClick}>
            Super Admin Panel
          </button>
        )}
        {users?.role === "admin" && (
          <button className="admin-button" onClick={handleAdminClick}>
            Admin Panel
          </button>
        )}
        {users?.role === "user" && (
          <button className="user-button" disabled>
            User Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
