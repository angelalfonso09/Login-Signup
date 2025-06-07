// src/pages/Userdb.jsx
import React, { useContext, useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar"; // Assuming you still use this, though not in the provided snippet's render
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/Userdb.module.css";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import Ph from "../Dashboard Meters/Ph";
import Tds from "../Dashboard Meters/Tds";
import Conductivity from "../Dashboard Meters/Conductivity";
import Salinity from "../Dashboard Meters/Salinity";
import Temperature from "../Dashboard Meters/Temperature";
import Turbidity from "../Dashboard Meters/Turbidity";
import ElectricalCon from "../Dashboard Meters/ElectricalCon";
import AccessRestrictedModal from "../components/AccessRestrictedModal";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios'; // Import axios for API calls

// API base URL - make sure this matches your backend
const API_BASE_URL = "http://localhost:5000";

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
    const { currentUser, login, logout, getToken } = useContext(AuthContext); // Use AuthContext
    const [showAccessModal, setShowAccessModal] = useState(false);
    const navigate = useNavigate();

    // State for AlertDialog
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    // Polling state to check for verification status periodically
    const [isPolling, setIsPolling] = useState(false);

    // NEW STATE: To store the sensors associated with the user's device
    const [associatedSensors, setAssociatedSensors] = useState([]);
    const [loadingSensors, setLoadingSensors] = useState(true);
    // userDeviceId and isUserVerified are now directly from AuthContext's currentUser
    // and updated via the login function when the backend sends new user data.

    // Removed getUserDataAndVerification useCallback as AuthContext provides this

    // Effect for initial setup and verification check
    useEffect(() => {
        // Use currentUser directly from AuthContext
        const user = currentUser;
        const isVerified = user?.isVerified || false;
        const deviceId = user?.deviceId || null;

        console.log("User verification status on load (from AuthContext):", isVerified);
        console.log("User Device ID on load (from AuthContext):", deviceId);

        // Logic for showing the access modal
        const showModalFlag = localStorage.getItem("showAccessModalOnLoad");

        if (showModalFlag === "true" && !isVerified) {
            setShowAccessModal(true);
            localStorage.removeItem("showAccessModalOnLoad");
            setIsPolling(true); // Start polling if modal is shown for unverified user
        } else if (isVerified) {
            localStorage.removeItem("showAccessModalOnLoad");
            console.log("User is already verified, skipping access request modal.");
            setShowAccessModal(false);
            setIsPolling(false); // Stop polling if already verified
        } else if (!isVerified && !deviceId) {
            // If not verified and no deviceId, always show the modal on initial load.
            // This covers cases where user registers but hasn't sent a request.
            setShowAccessModal(true);
            setIsPolling(true); // Start polling
        }
    }, [currentUser]); // Dependency on currentUser from AuthContext

    // Effect for polling verification status
    useEffect(() => {
        let pollInterval;
        if (isPolling) {
            pollInterval = setInterval(() => {
                // To get the absolute latest from localStorage without waiting for AuthContext re-render
                // It's better to refetch user data if a server-side change is expected
                // or ensure AuthContext updates reliably.
                // For now, let's trigger a re-fetch of user data to ensure up-to-dateness
                // A better approach would be to have a `refreshUser` function in AuthContext
                // that re-reads from localStorage or re-fetches from backend.

                const storedUserString = localStorage.getItem("user");
                let updatedUser = null;
                let newIsVerified = false;

                if (storedUserString) {
                    try {
                        updatedUser = JSON.parse(storedUserString);
                        newIsVerified = String(updatedUser.isVerified).toLowerCase() === "true" || updatedUser.isVerified === true;
                        // Use AuthContext's login to update its state and localStorage
                        login(updatedUser, getToken()); // This ensures AuthContext is truly in sync
                    } catch (e) {
                        console.error("Error parsing user from localStorage during polling:", e);
                    }
                }

                console.log("Polling for verification status (from localStorage):", newIsVerified);
                if (newIsVerified) {
                    setShowAccessModal(false);
                    setIsPolling(false);
                    setAlertMessage("Your account has been verified! You can now access all features.");
                    setShowAlert(true);
                    // No need to set isUserVerified and userDeviceId here, AuthContext's login handles it
                }
            }, 5000);
        }

        return () => {
            clearInterval(pollInterval);
        };
    }, [isPolling, login, getToken]); // Dependencies on login and getToken from AuthContext

    // NEW EFFECT: Fetch sensors based on currentUser's deviceId and isVerified status
    useEffect(() => {
        const fetchAssociatedSensors = async () => {
            // Use currentUser directly from AuthContext
            const userDeviceId = currentUser?.deviceId;
            const isUserVerified = currentUser?.isVerified;

            // Only proceed if deviceId exists AND user is verified
            if (!userDeviceId || !isUserVerified) {
                console.log("Skipping sensor fetch: No userDeviceId or user not verified.");
                setLoadingSensors(false);
                setAssociatedSensors([]); // Clear sensors if conditions aren't met
                return;
            }

            setLoadingSensors(true);
            try {
                const token = getToken(); // Get token from AuthContext
                if (!token) {
                    console.error("No token available for sensor fetch.");
                    setLoadingSensors(false);
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/devices/${userDeviceId}/sensors`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data) {
                    // IMPORTANT: Normalize sensor names from DB to match component map keys
                    const normalizedSensors = response.data.map(sensor => {
                        let normalizedName = sensor.sensor_name;

                        // Apply specific normalization rules for common variations
                        if (normalizedName && typeof normalizedName === 'string') {
                            const lowerCaseName = normalizedName.toLowerCase();
                            switch (lowerCaseName) {
                                case 'ph':
                                    normalizedName = 'pH Level'; // Your component map uses 'pH Level'
                                    break;
                                case 'temperature':
                                    normalizedName = 'Temperature';
                                    break;
                                case 'turbidity':
                                    normalizedName = 'Turbidity';
                                    break;
                                case 'conductivity':
                                    normalizedName = 'Conductivity';
                                    break;
                                case 'salinity':
                                    normalizedName = 'Salinity';
                                    break;
                                case 'tds':
                                    normalizedName = 'Total Dissolved Solids (TDS)';
                                    break;
                                case 'ec':
                                    normalizedName = 'Electrical Conductivity(Compensated)';
                                    break;
                                // Add more cases if you have other variations
                                default:
                                    // If no specific rule, try to capitalize first letter and handle spaces if needed
                                    normalizedName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
                                    break;
                            }
                        }
                        return { ...sensor, normalized_sensor_name: normalizedName };
                    });

                    setAssociatedSensors(normalizedSensors);
                    console.log(`Fetched and normalized sensors for device ${userDeviceId}:`, normalizedSensors);
                } else {
                    console.error("No data received for sensors:", response);
                    setAlertMessage("Failed to load device sensors: No data received.");
                    setShowAlert(true);
                }
            } catch (error) {
                console.error("Error fetching associated sensors:", error.response?.data || error);
                setAlertMessage(error.response?.data?.error || "Error fetching device sensors.");
                setShowAlert(true);
            } finally {
                setLoadingSensors(false);
            }
        };

        // Only call fetchAssociatedSensors if currentUser is available
        if (currentUser) {
            fetchAssociatedSensors();
        }

    }, [currentUser, getToken]); // Dependencies on currentUser and getToken from AuthContext

    const handleSendRequest = async (deviceIdFromModal) => {
        console.log("handleSendRequest function called.");
        console.log("Received deviceId from modal:", deviceIdFromModal);

        // Get user info directly from AuthContext
        const username = currentUser?.username || "Unknown User";
        const userId = currentUser?.id || "unknown-id";
        const deviceId = deviceIdFromModal || ""; // Use empty string if deviceIdFromModal is null/undefined

        console.log(`Extracted username: ${username}, userId: ${userId}, deviceId: ${deviceId}`);

        if (!deviceId || deviceId.trim() === "") {
            setAlertMessage("Please enter a valid Device ID to send the request.");
            setShowAlert(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/access-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromUser: username,
                    fromUserId: userId,
                    deviceId: deviceId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlertMessage(data.message);
                setShowAlert(true);
                setIsPolling(true);
                // If the request was successful, and backend *might* have updated user's deviceId
                // You might need to trigger a refresh of currentUser to reflect the new deviceId
                // This will be handled by the polling if `isVerified` changes, but if only `deviceId` changes,
                // and the user is not yet verified, it won't trigger an AuthContext update.
                // A better pattern would be: if backend returns updated user/token, use AuthContext.login(updatedUser, newToken)
                if (data.user && data.token) { // If your /api/access-requests endpoint starts returning user/token
                     login(data.user, data.token); // Update AuthContext
                }
            } else {
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
        console.log("Access Restricted Modal closed.");
        setShowAccessModal(false);
        setIsPolling(false);
        logout(); // Use AuthContext's logout to ensure full cleanup
    };

    // Sensor component mapping - ensure these keys exactly match the normalized names
    const sensorComponentsMap = {
        'Turbidity': Turbidity,
        'Temperature': Temperature,
        'Salinity': Salinity,
        'Conductivity': Conductivity,
        'Total Dissolved Solids (TDS)': Tds, // Adjusted from 'Tds' if your component is called Tds
        'pH Level': Ph, // This seems to be the correct one based on your image
        'Electrical Conductivity(Compensated)': ElectricalCon,
    };

    // Determine current verification and device ID from AuthContext
    const currentIsUserVerified = currentUser?.isVerified || false;
    const currentDeviceId = currentUser?.deviceId || null;

    // Render loading state for sensors
    if (loadingSensors) {
        return (
            <div className={`${styles.userDb} ${theme}`}>
                <div className={styles.userDbContainer}>
                    <Sidebar theme={theme} toggleTheme={toggleTheme} />
                    <div className={styles.userDbContents}>
                        <p>Loading your device's sensors...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render access restricted message if not verified AND no device ID set
    // This condition also handles the polling state implicitly, as polling will
    // eventually set isUserVerified to true and remove the modal.
    if (!currentIsUserVerified || !currentDeviceId) {
        return (
            <div className={`${styles.userDb} ${theme}`}>
                <div className={styles.userDbContainer}>
                    <Sidebar theme={theme} toggleTheme={toggleTheme} />
                    <div className={styles.userDbContents}>
                        <p>No sensors associated with your device, or waiting for verification.</p>
                    </div>
                </div>
                <AccessRestrictedModal
                    isOpen={showAccessModal || (!currentIsUserVerified && !isPolling)} // Keep modal open if not verified and not polling (initial state)
                    onClose={handleCloseModal}
                    onRequestSend={handleSendRequest}
                    message={
                        !currentDeviceId
                            ? "Please enter your Device ID to send an access request and get started."
                            : "You need Admin approval to view dashboard features. Your access request has been sent. Please wait for approval to continue or log out."
                    }
                    showDeviceIdInput={!currentDeviceId} // Show input only if deviceId is null
                />
                <AlertDialog
                    isOpen={showAlert}
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />
            </div>
        );
    }

    return (
        <div className={`${styles.userDb} ${theme}`}>
            <div className={styles.userDbContainer}>
                <Sidebar theme={theme} toggleTheme={toggleTheme} />
                <div className={styles.userDbContents}>
                    <div className={styles.meterRowFlex}>
                        {associatedSensors.length > 0 ? (
                            associatedSensors.map((sensor) => {
                                // Use the normalized_sensor_name for lookup
                                const SensorComponent = sensorComponentsMap[sensor.normalized_sensor_name];
                                if (SensorComponent) {
                                    return (
                                        <div className={styles.meterWidget} key={sensor.id}>
                                            {/* Display original sensor_name for user readability */}
                                            <div className={styles.meterLabel}>{sensor.sensor_name}</div>
                                            <SensorComponent deviceId={currentDeviceId} sensorId={sensor.id} />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={sensor.id} className={`${styles.meterWidget} ${styles.noComponent}`}>
                                        <div className={styles.meterLabel}>{sensor.sensor_name}</div>
                                        <div>No dedicated display component for this sensor type.</div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No sensors found for your device.</p>
                        )}
                    </div>
                </div>
            </div>
            {/* These modals should ideally not be shown if currentIsUserVerified is true */}
            {/* But keeping them here in case they are triggered by other states */}
            <AccessRestrictedModal
                isOpen={showAccessModal}
                onClose={handleCloseModal}
                onRequestSend={handleSendRequest}
                message={
                    !currentDeviceId
                        ? "Please enter your Device ID to send an access request and get started."
                        : "You need Admin approval to view dashboard features. Your access request has been sent. Please wait for approval to continue or log out."
                }
                showDeviceIdInput={!currentDeviceId}
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