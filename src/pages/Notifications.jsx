import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "../components/Sidebar";
import '../styles/Pages Css/Notifications.css';

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

const NotificationIcon = ({ type }) => {
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
  const getBackgroundColor = () => notification.read ? 'bg-gray-800/50' : 'bg-gray-800';
  const getTextColor = () => notification.read ? 'text-gray-400' : 'text-white';
  const getDescriptionColor = () => notification.read ? 'text-gray-500' : 'text-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${getBackgroundColor()} group p-4 rounded-xl shadow-md border border-gray-700 transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-700 rounded-full">
              <NotificationIcon type={notification.type} />
            </div>
            <div>
              <h4 className={`text-base font-semibold ${getTextColor()}`}>
                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
              </h4>
              <p className={`text-sm ${getDescriptionColor()}`}>{notification.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="hover:text-blue-500 transition"
                title="Mark as Read"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="hover:text-red-500 transition"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-14">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-gray-950 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 text-sm text-white hover:bg-gray-800 disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-500 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              Delete all
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500 text-center italic">No notifications available.</div>
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
