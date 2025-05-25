import React, { useState, useEffect, useContext, useCallback, useRef } from 'react'; // <-- Import useRef
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Pages Css/Notifications.css';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';

// --- Helper Functions for User Notifications in localStorage ---
const getUserNotificationsKey = (userId) => `userNotifications_${userId}`;

const loadUserNotifications = (userId) => {
    if (!userId) {
        console.warn("Attempted to load user notifications without a userId.");
        return [];
    }
    try {
        const storedNotifications = localStorage.getItem(getUserNotificationsKey(userId));
        return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
        console.error("Frontend (UserNotif): Failed to parse user notifications from localStorage:", error);
        return [];
    }
};

const saveUserNotifications = (userId, notifications) => {
    if (!userId) {
        console.warn("Attempted to save user notifications without a userId.");
        return;
    }
    try {
        localStorage.setItem(getUserNotificationsKey(userId), JSON.stringify(notifications));
    } catch (error) {
        console.error("Frontend (UserNotif): Failed to save user notifications to localStorage:", error);
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
                                Mark as Read
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className={`notification-action-button delete-button`}
                        >
                            <Trash2 className="delete-icon" />
                            Delete
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

const UserNotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);
    const [userId, setUserId] = useState(null);

    // Create a ref to hold the *latest* notifications state
    const notificationsRef = useRef(notifications);

    // Keep the ref's current value updated whenever 'notifications' state changes
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]); // This useEffect depends on 'notifications' to update the ref


    // Effect to retrieve current user's ID from localStorage
    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const currentUser = JSON.parse(userString);
                setUserId(currentUser.id);
            } catch (e) {
                console.error("Error parsing user from localStorage in UserNotif:", e);
            }
        }
    }, []);

    // Effect to load notifications initially and set up polling
    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }

        // Initial load of notifications for the user
        setNotifications(loadUserNotifications(userId));
        setLoading(false);
        console.log("Frontend (UserNotif): Initial notifications loaded for user:", userId);

        const pollInterval = setInterval(() => {
            const latestNotifications = loadUserNotifications(userId);
            // Compare with the latest value using the ref (notificationsRef.current)
            if (JSON.stringify(latestNotifications) !== JSON.stringify(notificationsRef.current)) {
                setNotifications(latestNotifications);
                console.log("Frontend (UserNotif): Polling detected new notifications.");
            }
        }, 3000); // Poll every 3 seconds (adjust as needed)

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(pollInterval);
    }, [userId]); // <-- IMPORTANT: 'notifications' REMOVED from dependencies!


    // Callback to save notifications to localStorage efficiently
    const memoizedSaveNotifications = useCallback(() => {
        if (!loading && userId) {
            saveUserNotifications(userId, notifications);
            console.log("Frontend (UserNotif): Notifications saved to localStorage.");
        }
    }, [loading, userId, notifications]);

    // Effect to trigger saving notifications whenever `memoizedSaveNotifications` changes
    useEffect(() => {
        memoizedSaveNotifications();
    }, [memoizedSaveNotifications]);


    const markAsRead = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => n.id === id ? { ...n, read: true } : n);
            console.log("Frontend (UserNotif): Marked notification as read:", id);
            return updated;
        });
    };

    const deleteNotification = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.filter(n => n.id !== id);
            console.log("Frontend (UserNotif): Deleted notification:", id);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => ({ ...n, read: true }));
            console.log("Frontend (UserNotif): Marked all notifications as read.");
            return updated;
        });
    };

    const deleteAllNotifications = () => {
        setNotifications([]);
        console.log("Frontend (UserNotif): Deleted all notifications.");
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={`notifications-container bg-${theme}-background text-${theme}-text`}>
            <div className="notifications-wrapper">
                <div className="notifications-header">
                    <h1 className={`notifications-title ${theme}-text`}>
                        User Notifications
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

const UserNotif = () => {
    return (
        <div className="Notifpage">
            <Sidebar />
            <div className="Notifpage-content">
                <UserNotificationsPage />
            </div>
        </div>
    );
};

export default UserNotif;