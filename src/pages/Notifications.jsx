import React, { useState, useEffect, useContext } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // Import axios
import '../styles/Pages Css/Notifications.css';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';

// Helper function to load notifications from localStorage
const loadNotifications = () => {
  try {
    const storedNotifications = localStorage.getItem('superAdminNotifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error("Frontend: Failed to parse notifications from localStorage:", error); // Added log
    return [];
  }
};

// Helper function to save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem('superAdminNotifications', JSON.stringify(notifications));
  } catch (error) {
    console.error("Frontend: Failed to save notifications to localStorage:", error); // Added log
  }
};

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="icon-success" />;
    case 'warning':
      return <AlertTriangle className="icon-warning" />;
    case 'error':
      return <XCircle className="icon-error" />;
    case 'info':
      return <Bell className="icon-info" />;
    case 'access_request':
      return <Bell className="icon-info" />;
    default:
      return <Bell className="icon-default" />;
  }
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onApproveRequest, onDeclineRequest }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`notification-card ${notification.read ? `read-${theme}` : `unread-${theme}`} border-${theme}`}>
        <div className="notification-content">
          <div className="notification-info">
            <div className="notification-icon-wrapper">
              <NotificationIcon type={notification.type} />
            </div>
            <div>
              <h4 className={`notification-type ${notification.read ? 'read' : 'unread'}`}>
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace('_', ' ')}
              </h4>
              <p className={`notification-message ${notification.read ? 'read' : 'unread'}`}>
                {notification.message}
              </p>
              {notification.type === 'access_request' && notification.status && (
                <p className={`notification-status status-${notification.status}`}>
                  Status: {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </p>
              )}
            </div>
          </div>
          <div className="notification-actions">
            {/* Action buttons for general notifications */}
            {!notification.read && notification.type !== 'access_request' && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className={`notification-action-button mark-read-button`}
              >
                <CheckCircle className="mark-read-icon" />
                </button>
            )}

            {/* Action buttons for access requests */}
            {notification.type === 'access_request' && notification.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    console.log("Frontend: Approve button clicked for notification:", notification.id, "User ID:", notification.fromUserId); // NEW LOG
                    onApproveRequest(notification.id, notification.fromUserId); // Pass userId and notificationId
                  }}
                  className={`notification-action-button approve-button`}
                  title="Approve Request"
                >
                  <ThumbsUp className="approve-icon" />
                </button>
                <button
                  onClick={() => {
                    console.log("Frontend: Decline button clicked for notification:", notification.id, "User ID:", notification.fromUserId); // NEW LOG
                    onDeclineRequest(notification.id, notification.fromUserId); // Pass userId and notificationId
                  }}
                  className={`notification-action-button decline-button`}
                  title="Decline Request"
                >
                  <ThumbsDown className="decline-icon" />
                </button>
              </>
            )}

            <button
              onClick={() => onDelete(notification.id)}
              className={`notification-action-button delete-button`}
            >
              <Trash2 className="delete-icon" />
            </button>
          </div>
        </div>
        <p className="notification-timestamp">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};


const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  // Define your API base URL
  const API_BASE_URL = "http://localhost:5000"; // Adjust if your backend runs on a different port/URL

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(loadNotifications());
      setLoading(false);
      console.log("Frontend: Notifications loaded from localStorage."); // Added log
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveNotifications(notifications);
      console.log("Frontend: Notifications saved to localStorage."); // Added log
    }
  }, [notifications, loading]);

  const markAsRead = (id) => {
    setNotifications(prevNotifications => {
      const updated = prevNotifications.map(n => n.id === id ? { ...n, read: true } : n);
      console.log("Frontend: Marked notification as read:", id); // Added log
      return updated;
    });
  };

  const deleteNotification = (id) => {
    setNotifications(prevNotifications => {
      const updated = prevNotifications.filter(n => n.id !== id);
      console.log("Frontend: Deleted notification:", id); // Added log
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => {
      const updated = prevNotifications.map(n => ({ ...n, read: true }));
      console.log("Frontend: Marked all notifications as read."); // Added log
      return updated;
    });
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    console.log("Frontend: Deleted all notifications."); // Added log
  };

  // --- MODIFIED: Handle approval of an access request with API call ---
  const handleApproveRequest = async (notificationId, userId) => {
    console.log("Frontend: Calling handleApproveRequest. Notification ID:", notificationId, "User ID:", userId); // NEW LOG
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      console.error("Frontend: No authentication token found. Cannot approve user access."); // NEW LOG
      alert("Error: No authentication token found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/approve-user-access`,
        { userId, notificationId }, // Send userId and notificationId to backend
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true // Important for sending cookies/credentials if any
        }
      );

      console.log("Frontend: API response for approval:", response.data); // NEW LOG
      alert(response.data.message);

      // Update local state and localStorage ONLY AFTER successful backend approval
      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(n =>
          n.id === notificationId
            ? { ...n, status: 'approved', read: true, actionTakenAt: new Date().toISOString() }
            : n
        );
        // Also remove the approved notification from the list if desired
        // return updated.filter(n => n.id !== notificationId);
        return updated;
      });

      // No longer need to manually update `localStorage` for other users or the current user's role here,
      // as the backend is now responsible for `is_verified` status.
      // The backend should also send a notification back to the approved user (if implemented there).

    } catch (error) {
      console.error("Frontend: Error approving user access:", error); // NEW LOG
      // More specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Frontend: Error data:", error.response.data);
        console.error("Frontend: Error status:", error.response.status);
        console.error("Frontend: Error headers:", error.response.headers);
        alert(`Failed to approve user access: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Frontend: No response received:", error.request);
        alert("Failed to approve user access: No response from server. Check network connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Frontend: Error message:", error.message);
        alert(`Failed to approve user access: ${error.message}`);
      }
    }
  };

  // --- MODIFIED: Handle declining of an access request with API call ---
  const handleDeclineRequest = async (notificationId, userId) => {
    console.log("Frontend: Calling handleDeclineRequest. Notification ID:", notificationId, "User ID:", userId); // NEW LOG
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("Frontend: No authentication token found. Cannot decline user access."); // NEW LOG
      alert("Error: No authentication token found. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/decline-user-access`,
        { userId, notificationId }, // Send userId and notificationId to backend
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      console.log("Frontend: API response for decline:", response.data); // NEW LOG
      alert(response.data.message);

      // Update local state and localStorage ONLY AFTER successful backend decline
      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(n =>
          n.id === notificationId
            ? { ...n, status: 'declined', read: true, actionTakenAt: new Date().toISOString() }
            : n
        );
        // Also remove the declined notification from the list if desired
        // return updated.filter(n => n.id !== notificationId);
        return updated;
      });

      // No longer need to manually send notifications to the user here.
      // The backend should handle sending a notification back to the declined user.

    } catch (error) {
      console.error("Frontend: Error declining user access:", error); // NEW LOG
      if (error.response) {
        console.error("Frontend: Error data:", error.response.data);
        console.error("Frontend: Error status:", error.response.status);
        alert(`Failed to decline user access: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error("Frontend: No response received:", error.request);
        alert("Failed to decline user access: No response from server. Check network connection.");
      } else {
        console.error("Frontend: Error message:", error.message);
        alert(`Failed to decline user access: ${error.message}`);
      }
    }
  };


  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`notifications-container bg-${theme}-background text-${theme}-text`}>
      <div className="notifications-wrapper">
        <div className="notifications-header">
          <h1 className={`notifications-title ${theme}-text`}>
            Notifications
          </h1>
          <div className="notifications-actions">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="notifications-button mark-all-read-button"
            >
              <CheckCircle className="action-icon" />
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
              className="notifications-button delete-all-button"
            >
              <Trash2 className="action-icon" />
              Delete all
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`loading-text text-${theme}-secondary-text`}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={`no-notifications-text text-${theme}-secondary-text italic`}>No notifications available.</div>
        ) : (
          <AnimatePresence>
            {notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onApproveRequest={handleApproveRequest}
                onDeclineRequest={handleDeclineRequest}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

const Notifications = () => {
  return (
    <div className="Notifpage">
      <Sidebar />
      <div className="Notifpage-content">
        <NotificationsPage />
      </div>
    </div>
  );
};

export default Notifications;