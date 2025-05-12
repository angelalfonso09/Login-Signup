import React, { useState, useEffect, useContext } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Pages Css/Notifications.css'; // Keep this for the overall page layout
import Sidebar from '../components/Sidebar'; // Adjust the import path as necessary
import { ThemeContext } from '../context/ThemeContext'; // Adjust the import path for your ThemeContext

const generateMockNotifications = () => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  return [
    { id: '1', type: 'success', message: 'Your data was successfully updated!', read: false, createdAt: now.toISOString() },
    { id: '2', type: 'warning', message: 'Please update your profile information.', read: false, createdAt: tenMinutesAgo },
    { id: '3', type: 'error', message: 'Failed to process your payment. Please try again.', read: false, createdAt: oneHourAgo },
    { id: '4', type: 'info', message: 'Welcome to the platform!', read: true, createdAt: oneDayAgo },
    { id: '5', type: 'success', message: 'Your order has shipped.', read: true, createdAt: twoDaysAgo },
    { id: '6', type: 'warning', message: 'Your storage is almost full.', read: true, createdAt: twoDaysAgo },
  ];
};

// NotificationIcon component stays mostly the same
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
    default:
      return <Bell className="icon-default" />;
  }
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
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
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </h4>
              <p className={`notification-message ${notification.read ? 'read' : 'unread'}`}>
                {notification.message}
              </p>
            </div>
          </div>
          <div className="notification-actions">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className={`notification-action-button mark-read-button`}
              >
                <CheckCircle className="mark-read-icon" />
              </button>
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(generateMockNotifications());
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const getButtonBorderClass = () => `border-${theme}-600`;
  const getButtonTextColorClass = () => `text-${theme}-text`;
  const getButtonHoverBgClass = () => `hover:bg-${theme}-hover`;
  const getDisabledOpacityClass = () => `disabled:opacity-40`;
  const getHeaderTextColorClass = () => `text-${theme}-heading`;

  const getDeleteButtonBorderClass = () => `border-red-500`;
  const getDeleteButtonTextColorClass = () => `text-red-400`;
  const getDeleteButtonHoverBgClass = () => `hover:bg-red-500/20`;

  const getLoadingTextColorClass = () => `text-${theme}-secondary-text`;
  const getNoNotificationsTextColorClass = () => `text-${theme}-secondary-text italic`;

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
