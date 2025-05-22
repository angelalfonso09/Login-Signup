import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/Userdb.module.css";
import { ThemeContext } from "../context/ThemeContext";
import Ph from "../Dashboard Meters/Ph";
import Tds from "../Dashboard Meters/Tds";
import Conductivity from "../Dashboard Meters/Conductivity";
import Salinity from "../Dashboard Meters/Salinity";
import Temperature from "../Dashboard Meters/Temperature";
import Turbidity from "../Dashboard Meters/Turbidity";
import ElectricalCon from "../Dashboard Meters/ElectricalCon";
import AccessRestrictedModal from "../components/AccessRestrictedModal";
import { useNavigate } from "react-router-dom";

const Userdb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let userString = localStorage.getItem('user');
    let currentUser = {};
    if (userString && userString !== "undefined" && userString !== "null") {
      try {
        currentUser = JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    // --- MODIFICATION START ---
    // Explicitly convert currentUser.isVerified to a boolean
    // It could be a boolean (true/false) or a string ("t"/"f") depending on localStorage quirks
    const isUserVerified = String(currentUser.isVerified).toLowerCase() === 'true' || currentUser.isVerified === true;
    // --- MODIFICATION END ---

    console.log("User verification status on load:", isUserVerified);

    const showModalFlag = localStorage.getItem("showAccessModalOnLoad");

    if (showModalFlag === "true" && !isUserVerified) {
      setShowAccessModal(true);
      localStorage.removeItem("showAccessModalOnLoad");
    } else if (isUserVerified) {
      localStorage.removeItem("showAccessModalOnLoad");
      console.log("User is already verified, skipping access request modal.");
    }
  }, []);

  const handleSendRequest = () => {
    console.log("handleSendRequest function called.");

    let userString = localStorage.getItem('user');
    let currentUser = {};

    if (userString && userString !== "undefined" && userString !== "null") {
      try {
        currentUser = JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    console.log("Current user from localStorage:", currentUser);

    const username = currentUser.username || 'Unknown User';
    const userId = currentUser.id || 'unknown-id';
    console.log(`Extracted username: ${username}, userId: ${userId}`);

    const newRequestId = Date.now();
    const notification = {
      id: newRequestId,
      type: 'access_request',
      fromUser: username,
      fromUserId: userId,
      message: `User '${username}' has requested access to restricted features.`,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'pending'
    };
    console.log("New notification object created:", notification);

    let superAdminNotificationsString = localStorage.getItem('superAdminNotifications');
    let existingNotifications = [];

    if (superAdminNotificationsString && superAdminNotificationsString !== "undefined" && superAdminNotificationsString !== "null") {
      try {
        existingNotifications = JSON.parse(superAdminNotificationsString);
      } catch (e) {
        console.error("Error parsing superAdminNotifications from localStorage:", e);
      }
    }
    console.log("Existing notifications before adding new:", existingNotifications);

    existingNotifications.push(notification);
    console.log("Notifications after adding new:", existingNotifications);

    localStorage.setItem('superAdminNotifications', JSON.stringify(existingNotifications));
    console.log("Notifications saved to localStorage under 'superAdminNotifications'.");

    alert("Your access request has been sent to the Super Admin for review.");
    setShowAccessModal(false);
  };

  const handleCloseModal = () => {
    console.log("Logout initiated from Userdb!");
    setShowAccessModal(false);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("showAccessModalOnLoad");

    navigate('/login', { replace: true });
  };

  return (
    <div className={`${styles.userDb} ${theme}`}>
      <div className={styles.userDbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.userDbContents}>
          <div className={styles.meterRowFlex}>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Turbidity</div>
              <Turbidity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Temperature</div>
              <Temperature />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Salinity</div>
              <Salinity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Conductivity</div>
              <Conductivity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Total Dissolved Solids (TDS)</div>
              <Tds />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>pH Level</div>
              <Ph />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Electrical Conductivity(Compensated)</div>
              <ElectricalCon />
            </div>
          </div>
        </div>
      </div>

      <AccessRestrictedModal
        isOpen={showAccessModal}
        onClose={handleCloseModal}
        onRequestSend={handleSendRequest}
        message="You need Super Admin approval to view certain advanced features or restricted data."
      />
    </div>
  );
};

export default Userdb;