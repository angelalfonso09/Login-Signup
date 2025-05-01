import React, { useState, useEffect, useContext, useRef } from "react";
import { FaBell } from "react-icons/fa";
import "../styles/navbar.css";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import io from "socket.io-client";

const Navbar = () => {
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [sensorData, setSensorData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const socket = useRef(null);
  const prevSensorRef = useRef(null);

  // Fetch user info (as is)
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

  // Real-time turbidity updates via Socket.IO
  useEffect(() => {
    socket.current = io(backendURL, { withCredentials: true });

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current.id); // Log socket connection
    });

    const handleUpdate = (latestData) => {
      console.log("📡 Received turbidity update:", latestData);

      const turbidityValue = parseFloat(latestData?.turbidity);
      const timestamp = new Date().toLocaleTimeString();

      if (!isNaN(turbidityValue)) {
        const prevData = prevSensorRef.current;

        // Clean water (exactly 100)
        if (turbidityValue === 100 && (!prevData || prevData.turbidity !== 100)) {
          setNotifications((prev) => {
            const newNotifications = [
              `✅ Water is clean (100%) as of ${timestamp}`,
              ...prev.filter((notif) => !notif.includes("Turbidity Status")),
            ];
            console.log("Notifications updated (clean water):", newNotifications);
            return newNotifications;
          });
        }

        // Not clean water (<40)
        else if (turbidityValue < 40 && (!prevData || prevData.turbidity >= 40)) {
          setNotifications((prev) => {
            const newNotifications = [
              `⚠️ Turbidity Alert: Water is not clean (${turbidityValue}%) as of ${timestamp}`,
              ...prev.filter((notif) => !notif.includes("Turbidity Status")),
            ];
            console.log("Notifications updated (alert):", newNotifications);
            return newNotifications;
          });
        }

        // Neutral (40–99) — clear notifications
        else if (
          turbidityValue >= 40 &&
          turbidityValue < 100 &&
          prevData &&
          (prevData.turbidity < 40 || prevData.turbidity === 100)
        ) {
          setNotifications((prev) => {
            const newNotifications = prev.filter(
              (notif) =>
                !notif.includes("Turbidity Alert") && !notif.includes("Water is clean")
            );
            console.log("Notifications updated (neutral):", newNotifications);
            return newNotifications;
          });
        }

        prevSensorRef.current = latestData;
        setSensorData(latestData);
      }
    };

    socket.current.on("updateTurbidityData", handleUpdate);

    return () => {
      socket.current.off("updateTurbidityData", handleUpdate);
      socket.current.disconnect();
    };
  }, [backendURL]);

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
