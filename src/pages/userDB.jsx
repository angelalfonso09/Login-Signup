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
import { useNavigate, Link } from "react-router-dom";

// Simple AlertDialog component to replace browser alerts
const AlertDialog = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto text-center">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          OK
        </button>
      </div>
    </div>
  );
};

const Userdb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const navigate = useNavigate();

  // State for AlertDialog
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Polling state to check for verification status periodically
  const [isPolling, setIsPolling] = useState(false);

  // Function to check user verification status from localStorage
  // NOTE: In a full production app, 'isVerified' status should ideally also be managed in your MySQL database
  // and updated by the Super Admin, and this function would query an endpoint on your Node.js backend.
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
      setIsPolling(true); // Start polling if modal is shown due to unverified status
    } else if (isVerified) {
      localStorage.removeItem("showAccessModalOnLoad");
      console.log("User is already verified, skipping access request modal.");
      setShowAccessModal(false); // Ensure modal is closed if verified
      setIsPolling(false); // Stop polling if already verified
    }
  }, []);

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
          setAlertMessage("Your account has been verified! You can now access all features.");
          setShowAlert(true);
          // Optionally, refresh user data or update UI
          // window.location.reload(); // Consider if a full reload is necessary or if state updates suffice
        }
      }, 5000); // Poll every 5 seconds (adjust as needed)
    }

    return () => {
      clearInterval(pollInterval); // Clean up the interval when component unmounts or polling stops
    };
  }, [isPolling]); // Rerun effect when isPolling changes

  const handleSendRequest = async () => {
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
    const userId = currentUser.id || "unknown-id"; // Assuming currentUser.id is the user's unique ID
    console.log(`Extracted username: ${username}, userId: ${userId}`);

    try {
      const response = await fetch('http://localhost:5000/api/access-requests', { // Make sure this URL matches your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You might include an authorization token here if your API is protected
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fromUser: username,
          fromUserId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) { // Check if the HTTP status code is 2xx
        setAlertMessage(data.message);
        setShowAlert(true);
        setIsPolling(true); // Start polling after successfully sending the request
      } else {
        // Handle backend errors (e.g., duplicate request, server error)
        setAlertMessage(data.message || 'An error occurred while sending your request.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Network or fetch error:", error);
      setAlertMessage("Could not connect to the server. Please try again later.");
      setShowAlert(true);
    }
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
        message="You need Super Admin approval to view certain advanced features or restricted data. Your access request has been sent. Please wait for approval to continue or log out."
      />
      <AlertDialog
        isOpen={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default Userdb;