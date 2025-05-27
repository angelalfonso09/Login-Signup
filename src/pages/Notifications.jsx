import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2, UserCheck, Check, X } from 'lucide-react'; // Changed 'Cross' to 'X' as 'Cross' is not a standard Lucide icon
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../styles/Pages Css/Notifications.css';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';

// --- Helper Functions for Super Admin Notifications ---
const loadSuperAdminNotifications = () => {
    try {
        const storedNotifications = localStorage.getItem('superAdminNotifications');
        return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
        console.error("Frontend: Failed to parse Super Admin notifications from localStorage:", error);
        return [];
    }
};

const saveSuperAdminNotifications = (notifications) => {
    try {
        localStorage.setItem('superAdminNotifications', JSON.stringify(notifications));
    } catch (error) {
        console.error("Frontend: Failed to save Super Admin notifications to localStorage:", error);
    }
};

// --- Helper Functions for User Notifications (copied for direct manipulation) ---
const getUserNotificationsKey = (userId) => `userNotifications_${userId}`;

const loadUserNotifications = (userId) => {
    if (!userId) return [];
    const savedNotifications = localStorage.getItem(getUserNotificationsKey(userId));
    return savedNotifications ? JSON.parse(savedNotifications) : [];
};

const saveUserNotifications = (userId, notifications) => {
    if (userId) {
        localStorage.setItem(getUserNotificationsKey(userId), JSON.stringify(notifications));
    }
};

// --- NotificationIcon component ---
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
            return <UserCheck className="icon-info" />;
        default:
            return <Bell className="icon-default" />;
    }
};

// --- NotificationCard component ---
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
                        {!notification.read && notification.type !== 'access_request' && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className={`notification-action-button mark-read-button`}
                                title="Mark as Read"
                            >
                                <CheckCircle className="mark-read-icon" />
                            </button>
                        )}

                        {notification.type === 'access_request' && notification.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => onApproveRequest(notification.id, notification.fromUserId)}
                                    className={`notification-action-button approve-button`}
                                    title="Approve Request"
                                >
                                    <Check className="approve-request-icon" /> {/* Changed to Check */}
                                </button>
                                <button
                                    onClick={() => onDeclineRequest(notification.id, notification.fromUserId)}
                                    className={`notification-action-button decline-button`}
                                    title="Decline Request"
                                >
                                    <X className="decline-request-icon" /> {/* Changed to X */}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => onDelete(notification.id)}
                            className={`notification-action-button delete-button`}
                            title="Delete Notification"
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

// --- NotificationsPage (Super Admin's Main Component) ---
const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);

    // Define your API base URL
    const API_BASE_URL = "http://localhost:5000";

    useEffect(() => {
        const timer = setTimeout(() => {
            setNotifications(loadSuperAdminNotifications());
            setLoading(false);
            console.log("Frontend (Super Admin): Notifications loaded from localStorage.");
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading) {
            saveSuperAdminNotifications(notifications);
            console.log("Frontend (Super Admin): Notifications saved to localStorage.");
        }
    }, [notifications, loading]);

    const markAsRead = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => n.id === id ? { ...n, read: true } : n);
            console.log("Frontend (Super Admin): Marked notification as read:", id);
            return updated;
        });
    };

    const deleteNotification = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.filter(n => n.id !== id);
            console.log("Frontend (Super Admin): Deleted notification:", id);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => ({ ...n, read: true }));
            console.log("Frontend (Super Admin): Marked all notifications as read.");
            return updated;
        });
    };

    const deleteAllNotifications = () => {
        setNotifications([]);
        console.log("Frontend (Super Admin): Deleted all notifications.");
    };

    // --- RE-MODIFIED: handleApproveRequest to include backend API call ---
    const handleApproveRequest = async (notificationId, userId) => {
        console.log("Frontend (Super Admin): Approving request for user:", userId);

        try {
            // Step 1: Send approval request to the backend API
            const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
            if (!token) {
                alert("Authentication token not found. Please log in again.");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/admin/approve-user-access`,
                { userId, notificationId }, // Send both userId and notificationId
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Backend response for approval:", response.data);

                // Step 2: Update the Super Admin's local notification status (frontend display)
                setNotifications(prevNotifications => {
                    const updatedNotifications = prevNotifications.map(n =>
                        n.id === notificationId
                            ? { ...n, status: 'approved', read: true, actionTakenAt: new Date().toISOString() }
                            : n
                    );
                    return updatedNotifications;
                });

                // Step 3: (For immediate frontend feedback/simulation) Update the target user's 'isVerified' status in their localStorage 'user' object
                // In a real application, the user would likely refresh their page or re-authenticate to get the updated status from the backend.
                // This localStorage manipulation is for immediate UI reflection in a single-browser testing scenario.
                let targetUserString = localStorage.getItem('user');
                if (targetUserString) {
                    try {
                        let targetUser = JSON.parse(targetUserString);
                        // Make sure we're updating the correct user's local storage if multiple users exist
                        if (targetUser.id === userId) {
                            targetUser.isVerified = true;
                            localStorage.setItem('user', JSON.stringify(targetUser));
                            console.log(`Frontend (Super Admin): User ${userId} 'isVerified' status updated in localStorage.`);
                        } else {
                            console.warn(`Frontend (Super Admin): User ID mismatch for localStorage update. Expected ${userId}, found ${targetUser.id}.`);
                        }
                    } catch (e) {
                        console.error("Frontend (Super Admin): Error parsing user data to verify in localStorage:", e);
                    }
                } else {
                    console.warn("Frontend (Super Admin): No 'user' object found in localStorage to update verification status.");
                }

                // Step 4: (For immediate frontend feedback/simulation) Add a success notification to the target user's specific notification list in localStorage
                // This is specifically for making the UserNotif.js component show the notification instantly.
                // In a real system, the backend would typically create this notification in the DB, and the user's frontend would fetch it.
                const userNotifications = loadUserNotifications(userId);
                const newUserNotification = {
                    id: `approved_${Date.now()}`,
                    type: 'success',
                    message: 'Your access request has been approved! You now have full access.',
                    read: false,
                    createdAt: new Date().toISOString(),
                };

                const hasExistingVerifiedNotif = userNotifications.some(
                    n => n.type === 'success' && n.message.includes('access request has been approved')
                );

                if (!hasExistingVerifiedNotif) { // Avoid adding duplicate notifications
                    const updatedUserNotifications = [newUserNotification, ...userNotifications];
                    saveUserNotifications(userId, updatedUserNotifications);
                    console.log(`Frontend (Super Admin): Success notification added to user ${userId}'s localStorage.`);
                } else {
                    console.log(`Frontend (Super Admin): User ${userId} already has an "approved" notification in localStorage.`);
                }

                alert("User access approved successfully!");

            } else {
                alert(`Approval failed: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Frontend (Super Admin): Error during user approval process:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                alert(`Failed to approve user: ${error.response.data.message || error.response.statusText}`);
            } else {
                alert("Failed to approve user due to a network or server error.");
            }
        }
    };

    // --- handleDeclineRequest (unchanged for simplicity, but could be modified to also use backend) ---
    const handleDeclineRequest = (notificationId, userId) => {
        console.log("Frontend (Super Admin): Declining request directly for user:", userId);

        // 1. Update the Super Admin's local notification status
        setNotifications(prevNotifications => {
            const updatedNotifications = prevNotifications.map(n =>
                n.id === notificationId
                    ? { ...n, status: 'declined', read: true, actionTakenAt: new Date().toISOString() }
                    : n
            );
            return updatedNotifications;
        });

        // 2. Add a decline notification to the target user's specific notification list in localStorage
        const userNotifications = loadUserNotifications(userId);
        const newUserNotification = {
            id: `declined_${Date.now()}`,
            type: 'error', // Or 'info', 'warning'
            message: 'Your access request has been declined. Please contact support for more information.',
            read: false,
            createdAt: new Date().toISOString(),
        };

        const updatedUserNotifications = [newUserNotification, ...userNotifications];
        saveUserNotifications(userId, updatedUserNotifications);
        console.log(`Frontend (Super Admin): Decline notification added to user ${userId}'s localStorage.`);

        alert("User access declined and notification sent to user's page!");
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