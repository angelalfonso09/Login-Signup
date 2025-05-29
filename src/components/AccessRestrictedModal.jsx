import React from "react";
import "../styles/Components Css/AccessRestrictedModal.css";

const AccessRestrictedModal = ({ isOpen, onClose, onRequestSend }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-access">
        <h2 className="modal-title">Access Restricted</h2>
        {/* Simplified message to reflect the new persistent behavior */}
        <p className="modal-message">
          You need Super Admin approval to view sensor data.
          Your request for access has been sent. Please wait for approval, or log out.
        </p>
        <div className="modal-actions">
          {/* We'll make the "Send Request" button less prominent or hide it after first send */}
          <button className="modal-button send-request" onClick={onRequestSend}>
            Resend Request (if needed)
          </button>
          {/* The only way to dismiss the modal, other than approval, is to log out */}
          <button className="modal-button logout" onClick={onClose}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRestrictedModal;