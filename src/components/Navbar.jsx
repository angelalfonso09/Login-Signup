import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import "../styles/navbar.css";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [sensorData, setSensorData] = useState(null);
  const [prevSensorData, setPrevSensorData] = useState(null);
  const [notifications, setNotifications] = useState([
    "✅ Your profile was updated.",
    "📅 New event scheduled for Friday.",
    "🔧 System maintenance at 10 PM.",
  ]);

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${backendURL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setUsers(response.data);
      } catch (err) {
        console.error(
          `❌ Error fetching user:`,
          err.response ? err.response.data : err.message
        );
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${backendURL}/api/sensors/latest`, {
          withCredentials: true,
        });
  
        const latestData = response.data;
        console.log("Fetched Data:", latestData); // Log the fetched data for debugging
  
        // Check if turbidity is high (greater than 60) and compare with previous sensor data
        if (
          latestData?.turbidity &&
          parseFloat(latestData.turbidity) > 60 &&
          (!prevSensorData || prevSensorData.turbidity !== latestData.turbidity)
        ) {
          setNotifications((prev) => [
            `⚠️ High Turbidity Detected: ${latestData.turbidity}% at ${new Date().toLocaleTimeString()}`,
            ...prev,
          ]);
        }
  
        setPrevSensorData(latestData);  // Save the latest data as the previous data
        setSensorData(latestData);       // Set the latest data as the current sensor data
      } catch (err) {
        console.error("❌ Failed to fetch sensor data:", err.message);
      }
    }, 10000); // Poll every 10 seconds
  
    return () => clearInterval(interval);
  }, [prevSensorData]);
  
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
                <p className="account-name">
                  {users?.username || "Unknown User"}
                </p>
                <p className="account-email">{users?.email || "No Email"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="right-section">
        <div className="notification-wrapper">
          <FaBell
            className="notification-icon"
            onClick={() => setShowModal(true)}
          />
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </div>


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

      {showModal && (
        <div
          className="notif-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔔 Notifications</h3>
            <ul>
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <li key={index}>{notif}</li>
                ))
              ) : (
                <li>No notifications yet 📭</li>
              )}
            </ul>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Navbar;
