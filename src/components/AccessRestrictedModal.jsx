import React from "react";
import "../styles/Components Css/AccessRestrictedModal.css"; // We'll create this CSS file

const AccessRestrictedModal = ({ isOpen, onClose, onRequestSend }) => {
  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Access Restricted</h2>
        <p className="modal-message">
          You need Super Admin approval to view sensor data.
        </p>
        <p className="modal-question">Would you like to send a request for access?</p>
        <div className="modal-actions">
          <button className="modal-button send-request" onClick={onRequestSend}>
            Send Request
          </button>
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRestrictedModal;