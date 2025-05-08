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
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 1000).toISOString();

  return [
    { id: '1', type: 'success', message: 'Your data was successfully updated!', read: false, createdAt: now.toISOString() },
    { id: '2', type: 'warning', message: 'Please update your profile information.', read: false, createdAt: tenMinutesAgo },
    { id: '3', type: 'error', message: 'Failed to process your payment. Please try again.', read: false, createdAt: oneHourAgo },
    { id: '4', type: 'info', message: 'Welcome to the platform!', read: true, createdAt: oneDayAgo },
    { id: '5', type: 'success', message: 'Your order has shipped.', read: true, createdAt: twoDaysAgo },
    { id: '6', type: 'warning', message: 'Your storage is almost full.', read: true, createdAt: twoDaysAgo },
  ];
};

const NotificationIcon = ({ type }) => {
  // Icon colors can be adjusted based on the theme if needed by adding dynamic classes
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'info':
      return <Bell className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const { theme } = useContext(ThemeContext);

  const getBackgroundColorClass = () =>
    notification.read ? `notification-card-read-${theme}` : `notification-card-unread-${theme}`;
  const getTextColorClass = () =>
    notification.read ? `notification-type-read-${theme}` : `notification-type-unread-${theme}`;
  const getDescriptionColorClass = () =>
    notification.read ? `notification-message-read-${theme}` : `notification-message-unread-${theme}`;
  const getBorderColorClass = () => `border-${theme}-700`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`notification-card ${getBackgroundColorClass()} group ${getBorderColorClass()} transition-all`}>
        <div className="notification-content">
          <div className="notification-info">
            <div className="notification-icon-wrapper">
              <NotificationIcon type={notification.type} />
            </div>
            <div>
              <h4 className={`notification-type ${getTextColorClass()}`}>
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </h4>
              <p className={`notification-message ${getDescriptionColorClass()}`}>{notification.message}</p>
            </div>
          </div>
          <div className="notification-actions">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className={`notification-actions button hover:text-blue-500 transition text-${theme}-text`}
                title="Mark as Read"
              >
                <CheckCircle className={`mark-read-icon text-${theme}-icon`} />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className={`notification-actions button hover:text-red-500 transition text-${theme}-text`}
              title="Delete"
            >
              <Trash2 className={`delete-icon text-${theme}-icon`} />
            </button>
          </div>
        </div>
        <p className={`notification-timestamp text-${theme}-secondary-text`}>
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
              className={`notifications-button mark-as-read-button border-${theme}-600 text-${theme}-text hover:bg-${theme}-hover disabled:opacity-40`}
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
              className={`notifications-button delete-all-button border-red-500 text-red-400 hover:bg-red-500/20 disabled:opacity-40`}
            >
              <Trash2 className="w-4 h-4" />
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

const Notifiactions = () => {
  return (
    <div className="Notifpage">
      <Sidebar />
      <div className="Notifpage-content">
        <NotificationsPage />
      </div>
    </div>
  );
};

export default Notifiactions;