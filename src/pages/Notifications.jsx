import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2, UserCheck, Check, X, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../styles/Pages Css/Notifications.css';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';

// --- Helper Functions for User Notifications (kept outside as they might be used elsewhere) ---
// If these are *also* only used within NotificationsPage, consider moving them inside as well.
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
        case 'sensor':
            return <AlertTriangle className="icon-warning" />;
        case 'request':
            return <UserCheck className="icon-info" />;
        case 'new_user':
            return <UserCheck className="icon-info" />;
        case 'schedule':
            return <CalendarCheck className="icon-info" />; // Using CalendarCheck icon for scheduled events
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

// --- NotificationCard component ---
const NotificationCard = ({ notification, onMarkAsRead, onDelete, onApproveRequest, onDeclineRequest }) => {
    const { theme } = useContext(ThemeContext);

    // Function to format the display type for readability
    const getDisplayType = (type) => {
        switch (type) {
            case 'request': return 'Access Request';
            case 'new_user': return 'New User';
            case 'sensor': return 'Sensor Alert';
            case 'schedule': return 'Scheduled Event';
            default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
        }
    };

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
                                {getDisplayType(notification.type)}
                            </h4>
                            <p className={`notification-message ${notification.read ? 'read' : 'unread'}`}>
                                {notification.message}
                            </p>
                            {/* Display status only for 'request' type */}
                            {notification.type === 'request' && notification.status && (
                                <p className={`notification-status status-${notification.status}`}>
                                    Status: {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="notification-actions">
                        {/* Mark as Read button (not for access requests, and optionally not for schedule) */}
                        {!notification.read && notification.type !== 'request' && notification.type !== 'schedule' && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className={`notification-action-button mark-read-button`}
                                title="Mark as Read"
                            >
                                <CheckCircle className="mark-read-icon" />
                            </button>
                        )}

                        {/* Approval/Decline buttons for 'request' type and 'pending' status */}
                        {notification.type === 'request' && notification.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => onApproveRequest(notification.id, notification.fromUserId)}
                                    className={`notification-action-button approve-button`}
                                    title="Approve Request"
                                >
                                    <Check className="approve-request-icon" />
                                </button>
                                <button
                                    onClick={() => onDeclineRequest(notification.id, notification.fromUserId)}
                                    className={`notification-action-button decline-button`}
                                    title="Decline Request"
                                >
                                    <X className="decline-request-icon" />
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

    const API_BASE_URL = "http://localhost:5000";

    // --- Helper Functions for Super Admin Notifications (MOVED INSIDE COMPONENT) ---
    // Wrapped with useCallback to ensure stable function references for dependency arrays.
    const loadSuperAdminNotifications = useCallback(() => {
        try {
            const storedNotifications = localStorage.getItem('superAdminNotifications');
            return storedNotifications ? JSON.parse(storedNotifications) : [];
        } catch (error) {
            console.error("Frontend: Failed to parse Super Admin notifications from localStorage:", error);
            return [];
        }
    }, []);

    const saveSuperAdminNotifications = useCallback((notificationsToSave) => {
        try {
            localStorage.setItem('superAdminNotifications', JSON.stringify(notificationsToSave));
        } catch (error) {
            console.error("Frontend: Failed to save Super Admin notifications to localStorage:", error);
        }
    }, []);

    // --- Function to fetch notifications and events from the backend ---
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // Get admin's token
            if (!token) {
                console.warn("No authentication token found for admin. Cannot fetch notifications.");
                setNotifications(loadSuperAdminNotifications()); // Fallback to localStorage
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/admin/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setNotifications(response.data.notifications);
                saveSuperAdminNotifications(response.data.notifications); // Update localStorage cache
                console.log("Frontend (Super Admin): Notifications and Events fetched from database.");
            } else {
                console.error("Failed to fetch notifications and events:", response.data.message);
                setNotifications(loadSuperAdminNotifications()); // Fallback on backend error
            }
        } catch (error) {
            console.error("Error fetching notifications and events from backend:", error);
            setNotifications(loadSuperAdminNotifications()); // Fallback on network error
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, loadSuperAdminNotifications, saveSuperAdminNotifications]); // Dependencies for fetchNotifications

    // Effect hook to fetch data on component mount and set up polling
    useEffect(() => {
        fetchNotifications();
        const pollInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(pollInterval); // Cleanup on unmount
    }, [fetchNotifications]); // Re-run if fetchNotifications changes (controlled by useCallback)

    // Effect hook to save notifications to localStorage whenever 'notifications' state changes
    useEffect(() => {
        if (!loading) { // Only save once loading is complete
            saveSuperAdminNotifications(notifications);
            console.log("Frontend (Super Admin): Notifications saved to localStorage.");
        }
    }, [notifications, loading, saveSuperAdminNotifications]); // Dependencies for saving

    const markAsRead = (id) => {
        // TODO: In a real app, this should also make a backend API call to update `is_read` status in the DB
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => n.id === id ? { ...n, read: true } : n);
            console.log("Frontend (Super Admin): Marked notification as read:", id);
            return updated;
        });
    };

    const deleteNotification = (id) => {
        // TODO: In a real app, this should also make a backend API call to delete the notification from the DB.
        // For events (prefixed with 'event_'), you'd need a separate endpoint like /api/admin/events/:id.
        setNotifications(prevNotifications => {
            const updated = prevNotifications.filter(n => n.id !== id);
            console.log("Frontend (Super Admin): Deleted notification:", id);
            return updated;
        });
    };

    const markAllAsRead = () => {
        // TODO: Backend API call needed for this too
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => ({ ...n, read: true }));
            console.log("Frontend (Super Admin): Marked all notifications as read.");
            return updated;
        });
    };

    const deleteAllNotifications = () => {
        // TODO: Backend API call needed for this too
        setNotifications([]);
        console.log("Frontend (Super Admin): Deleted all notifications.");
    };

    // --- handleApproveRequest with backend API call ---
    const handleApproveRequest = async (notificationId, userId) => {
        console.log("Frontend (Super Admin): Approving request for user:", userId);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication token not found. Please log in again.");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/admin/approve-user-access`,
                { userId, notificationId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Backend response for approval:", response.data);

                // Update the Super Admin's local notification status (frontend display)
                setNotifications(prevNotifications => {
                    const updatedNotifications = prevNotifications.map(n =>
                        n.id === notificationId
                            ? { ...n, status: 'approved', read: true, actionTakenAt: new Date().toISOString() }
                            : n
                    );
                    return updatedNotifications;
                });

                // (Simulated localStorage update for target user's isVerified status and notification)
                // In a full system, the user's frontend would fetch their updated status and notifications from the backend upon login/refresh.
                let targetUserString = localStorage.getItem('user');
                if (targetUserString) {
                    try {
                        let targetUser = JSON.parse(targetUserString);
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

                if (!hasExistingVerifiedNotif) {
                    const updatedUserNotifications = [newUserNotification, ...userNotifications];
                    saveUserNotifications(userId, updatedUserNotifications);
                    console.log(`Frontend (Super Admin): Success notification added to user ${userId}'s localStorage.`);
                } else {
                    console.log(`Frontend (Super Admin): User ${userId} already has an "approved" notification in localStorage.`);
                }

                alert("User access approved successfully!");
                fetchNotifications(); // Refresh notifications from DB after action
            } else {
                alert(`Approval failed: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Frontend (Super Admin): Error during user approval process:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error response data:", error.response.data);
                alert(`Failed to approve user: ${error.response.data.message || error.response.statusText}`);
            } else {
                alert("Failed to approve user due to a network or server error.");
            }
        }
    };

    // --- handleDeclineRequest with backend API call ---
    const handleDeclineRequest = async (notificationId, userId) => {
        console.log("Frontend (Super Admin): Declining request for user:", userId);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication token not found. Please log in again.");
                return;
            }

            // You'll need a backend endpoint for declining requests too.
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/decline-user-access`, // This endpoint needs to be created in your server.js
                { userId, notificationId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
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
                    type: 'error',
                    message: 'Your access request has been declined. Please contact support for more information.',
                    read: false,
                    createdAt: new Date().toISOString(),
                };

                const updatedUserNotifications = [newUserNotification, ...userNotifications];
                saveUserNotifications(userId, updatedUserNotifications);
                console.log(`Frontend (Super Admin): Decline notification added to user ${userId}'s localStorage.`);

                alert("User access declined and notification sent to user's page!");
                fetchNotifications(); // Refresh notifications from DB after action
            } else {
                 alert(`Decline failed: ${response.data.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error("Frontend (Super Admin): Error during user decline process:", error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Failed to decline user: ${error.response.data.message || error.response.statusText}`);
            } else {
                alert("Failed to decline user due to a network or server error.");
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
                    <div className={`loading-text text-${theme}-secondary-text`}>Loading notifications and events from database...</div>
                ) : notifications.length === 0 ? (
                    <div className={`no-notifications-text text-${theme}-secondary-text italic`}>No notifications or events available.</div>
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