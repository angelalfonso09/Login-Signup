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
import { useNavigate, Link } from "react-router-dom"; // Import Link as well

const Userdb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const navigate = useNavigate();

  // Polling state to check for verification status periodically
  const [isPolling, setIsPolling] = useState(false);

  // Function to check user verification status from localStorage
  const checkUserVerification = () => {
    let userString = localStorage.getItem("user");
    if (userString && userString !== "undefined" && userString !== "null") {
      try {
        const currentUser = JSON.parse(userString);
        return String(currentUser.isVerified).toLowerCase() === "true" || currentUser.isVerified === true;
      } catch (e) {
        console.error("Error parsing user from localStorage in checkUserVerification:", e);
        return false;
      }
    }
    return false;
  };


  useEffect(() => {
    const isVerified = checkUserVerification();
    console.log("User verification status on load:", isVerified);

    const showModalFlag = localStorage.getItem("showAccessModalOnLoad");

    if (showModalFlag === "true" && !isVerified) {
      setShowAccessModal(true);
      localStorage.removeItem("showAccessModalOnLoad");
      // Start polling if modal is shown due to unverified status
      setIsPolling(true);
    } else if (isVerified) {
      localStorage.removeItem("showAccessModalOnLoad");
      console.log("User is already verified, skipping access request modal.");
      setShowAccessModal(false); // Ensure modal is closed if verified
      setIsPolling(false); // Stop polling if already verified
    }
  }, []); // Run once on component mount

  // Polling effect: This useEffect will continuously check verification status if isPolling is true
  useEffect(() => {
    let pollInterval;
    if (isPolling) {
      pollInterval = setInterval(() => {
        const isVerified = checkUserVerification();
        console.log("Polling for verification status:", isVerified);
        if (isVerified) {
          // If verified, close the modal, stop polling, and optionally show a success message
          setShowAccessModal(false);
          setIsPolling(false);
          alert("Your account has been verified! You can now access all features.");
          // Optionally, refresh user data or update UI
          // Reloading the page might be the simplest way to refresh permissions, but can be jarring.
          // window.location.reload();
        }
      }, 5000); // Poll every 5 seconds (adjust as needed)
    }

    return () => {
      clearInterval(pollInterval); // Clean up the interval when component unmounts or polling stops
    };
  }, [isPolling]); // Rerun effect when isPolling changes


  const handleSendRequest = () => {
    console.log("handleSendRequest function called.");

    let userString = localStorage.getItem("user");
    let currentUser = {};

    if (userString && userString !== "undefined" && userString !== "null") {
      try {
        currentUser = JSON.parse(userString);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    console.log("Current user from localStorage:", currentUser);

    const username = currentUser.username || "Unknown User";
    const userId = currentUser.id || "unknown-id";
    console.log(`Extracted username: ${username}, userId: ${userId}`);

    // Check if a pending request already exists for this user
    let superAdminNotificationsString = localStorage.getItem("superAdminNotifications");
    let existingNotifications = [];
    if (superAdminNotificationsString && superAdminNotificationsString !== "undefined" && superAdminNotificationsString !== "null") {
      try {
        existingNotifications = JSON.parse(superAdminNotificationsString);
      } catch (e) {
        console.error("Error parsing superAdminNotifications from localStorage:", e);
      }
    }

    const hasPendingRequest = existingNotifications.some(
      (n) => n.type === "access_request" && n.fromUserId === userId && n.status === "pending"
    );

    if (hasPendingRequest) {
      alert("You already have a pending access request. Please wait for the Super Admin's review.");
      // Do NOT close the modal here if a pending request exists
      // setShowAccessModal(false); // Removed
      return; // Stop the function here
    }

    const newRequestId = Date.now();
    const notification = {
      id: newRequestId,
      type: "access_request",
      fromUser: username,
      fromUserId: userId,
      message: `User '${username}' has requested access to restricted features.`,
      timestamp: new Date().toISOString(),
      read: false,
      status: "pending", // Ensure status is "pending"
    };
    console.log("New notification object created:", notification);

    existingNotifications.push(notification);
    console.log("Notifications after adding new:", existingNotifications);

    localStorage.setItem(
      "superAdminNotifications",
      JSON.stringify(existingNotifications)
    );
    console.log(
      "Notifications saved to localStorage under 'superAdminNotifications'."
    );

    // alert("Your access request has been sent to the Super Admin for review."); // REMOVED ALERT
    // Do NOT close the modal immediately after sending the request
    // setShowAccessModal(false); // REMOVED
    setIsPolling(true); // Start polling after sending the request
  };

  const handleCloseModal = () => {
    console.log("Logout initiated from Userdb!");
    setShowAccessModal(false);
    setIsPolling(false); // Stop polling if user closes the modal (e.g., to log out)

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("showAccessModalOnLoad");

    navigate("/login", { replace: true });
  };

  return (
    <div className={`${styles.userDb} ${theme}`}>
      <div className={styles.userDbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.userDbContents}>
          {/* Add a navigation link/button here for notifications */}
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
        onClose={handleCloseModal} // This will now likely trigger a logout
        onRequestSend={handleSendRequest}
        message="You need Super Admin approval to view certain advanced features or restricted data. Your access request has been sent. Please wait for approval to continue or log out."
      />
    </div>
  );
};

export default Userdb;