import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/adminDB.module.css";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import AdminDashboardPage from "../components/AdminDashboardPage";
import EstablishmentSensors from "../components/DashboardEstablishment-UI";
import Calendar from "../components/CalendarComponent";
// Import socket.io-client and your socket instance
import io from 'socket.io-client';
import socket from '../Dashboard Meters/socket'; // Assuming 'socket.js' is in '../Dashboard Meters'

const AdminDb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, getToken } = useContext(AuthContext);

  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- States for the Global Warning Pop-up ---
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningTitle, setWarningTitle] = useState('⚠️ Water Quality Alert!');

  const fetchEstablishments = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`https://login-signup-3470.onrender.com/api/admin/assigned-establishments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      console.log("AdminDb - Data received from backend for assigned establishments:", data);
      setEstablishments(data);
    } catch (err) {
      console.error("AdminDb - Failed to fetch establishments:", err);
      setError(`Failed to load assigned establishments: ${err.message}. Please ensure you are logged in as an Admin/Super Admin.`);
      setEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchEstablishments();
    } else {
      setLoading(false);
      setError("Please log in to view assigned establishments.");
      setEstablishments([]);
    }
  }, [currentUser]);

  // --- Socket.IO Listener for Global Notifications ---
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log('AdminDb received new notification:', notification);

      const cleanedMessage = notification.message.replace('⚠️ Alert: ', '');

      setWarningMessage(`${cleanedMessage} Please take actions now.`);
      setShowWarningPopup(true); // Show the pop-up
    };

    // Ensure the socket is connected before listening
    if (socket) {
      socket.on('newNotification', handleNewNotification);
    }


    return () => {
      // Clean up the event listener when the component unmounts
      if (socket) {
        socket.off('newNotification', handleNewNotification);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const handleDeleteEstablishment = async (establishmentId, establishmentName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${establishmentName}"? This action cannot be undone.`);

    if (!isConfirmed) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token missing for delete operation.");
      }

      const response = await fetch(`https://login-signup-3470.onrender.com/api/establishments/${establishmentId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error deleting establishment ${establishmentId}:`, response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }

      console.log(`Establishment ${establishmentId} deleted successfully.`);
      await fetchEstablishments();
    } catch (error) {
      console.error("Failed to delete establishment:", error);
      setError(`Failed to delete establishment: ${error.message}`);
    }
  };

  return (
    <div className={`${styles.admindb} ${theme}`}>
      <div className={styles.admindbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.admindbContents}>
          <div className={styles.mainMetrics}>
            <AdminDashboardPage />
          </div>

          <div className={styles.mainContentGrid}>
            <div className={styles.establishmentSection}>
              <h2>Assigned Establishments</h2>
              {loading && <p>Loading assigned establishments...</p>}
              {error && <p className={styles.errorMessage}>{error}</p>}
              {!loading && !error && establishments.length === 0 && (
                <p>No establishments assigned to this admin yet, or user not logged in as Admin.</p>
              )}
              <div className={styles.establishmentCards}>
                {establishments.map((establishment) => {
                  return (
                    <EstablishmentSensors
                      key={establishment.id}
                      establishment={establishment}
                      onDelete={handleDeleteEstablishment}
                    />
                  );
                })}
              </div>
            </div>

            <div className={styles.calendarSection}>
              <Calendar />
            </div>
          </div>
        </div>
      </div>

      {/* Global Pop-up Warning Notification (Centered on Screen) */}
      {showWarningPopup && (
        <div className="warning-popup"> {/* Ensure you have this class in your CSS */}
          <div className="popup-content"> {/* Ensure you have this class in your CSS */}
            <h3>{warningTitle}</h3>
            <p>{warningMessage}</p>
            <button onClick={() => setShowWarningPopup(false)} className="close-popup">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDb;