import React, { useState } from "react"; // Import useState
import "../styles/Components Css/AccessRestrictedModal.css";

const AccessRestrictedModal = ({ isOpen, onClose, onRequestSend }) => {
  if (!isOpen) return null;

  // State to hold the device ID input by the user
  const [deviceIdInput, setDeviceIdInput] = useState("");

  // Function to handle the send request button click
  const handleSendRequestClick = () => {
    // Pass the deviceIdInput to the onRequestSend function
    onRequestSend(deviceIdInput);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-access">
        <h2 className="modal-title">Access Restricted</h2>
        <p className="modal-message">
          You need Super Admin approval to view sensor data.
          Please enter your device ID to send an access request.
        </p>

        {/* New: Input field for Device ID */}
        <div className="device-id-input-container">
          <label htmlFor="deviceId" className="device-id-label">Device ID:</label>
          <input
            type="text"
            id="deviceId"
            className="device-id-input"
            value={deviceIdInput}
            onChange={(e) => setDeviceIdInput(e.target.value)}
            placeholder="Enter your device ID"
          />
        </div>

        <div className="modal-actions">
          {/* Update onClick to use the new handler */}
          <button
            className="modal-button send-request"
            onClick={handleSendRequestClick}
            // Disable button if deviceIdInput is empty
            disabled={!deviceIdInput.trim()}
          >
            Send Access Request
          </button>
          <button className="modal-button logout" onClick={onClose}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRestrictedModal;