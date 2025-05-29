import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Trash2, CalendarCheck } from 'lucide-react'; // Import CalendarCheck
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // Import axios
import '../styles/Pages Css/Notifications.css';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../context/ThemeContext';

// --- NotificationIcon component (updated for 'schedule' type) ---
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
        case 'schedule': // New case for events
            return <CalendarCheck className="icon-info" />; // Using CalendarCheck icon
        default:
            return <Bell className="icon-default" />;
    }
};

// --- NotificationCard component (updated for 'schedule' type display) ---
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
    const { theme } = useContext(ThemeContext);

    // Function to format the display type
    const getDisplayType = (type) => {
        switch (type) {
            case 'schedule': return 'Scheduled Event'; // Display name for events
            default: return type.charAt(0).toUpperCase() + type.slice(1);
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
                        </div>
                    </div>
                    <div className="notification-actions">
                        {/* Optionally hide mark as read for schedules if they are more like fixed calendar entries */}
                        {!notification.read && notification.type !== 'schedule' && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                className={`notification-action-button mark-read-button`}
                                title="Mark as Read"
                            >
                                <CheckCircle className="mark-read-icon" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className={`notification-action-button delete-button`}
                            title="Delete"
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


const AdminNotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);

    const API_BASE_URL = "http://localhost:5000";

    // Re-introduce localStorage helpers or ensure they are accessible
    const loadAdminNotifications = useCallback(() => {
        try {
            const storedNotifications = localStorage.getItem('adminSchedules'); // Use a different key for schedules
            return storedNotifications ? JSON.parse(storedNotifications) : [];
        } catch (error) {
            console.error("Frontend: Failed to parse Admin schedules from localStorage:", error);
            return [];
        }
    }, []);

    const saveAdminNotifications = useCallback((notificationsToSave) => {
        try {
            localStorage.setItem('adminSchedules', JSON.stringify(notificationsToSave)); // Use a different key
        } catch (error) {
            console.error("Frontend: Failed to save Admin schedules to localStorage:", error);
        }
    }, []);


    // --- fetchSchedules function to get ONLY 'schedule' type from backend ---
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // Assuming admin has a token for authentication
            if (!token) {
                console.warn("No authentication token found for admin. Cannot fetch schedules.");
                setNotifications(loadAdminNotifications());
                setLoading(false);
                return;
            }

            // Fetch only 'schedule' type from the backend
            const response = await axios.get(`${API_BASE_URL}/api/admin/notifications?type=schedule`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setNotifications(response.data.notifications);
                saveAdminNotifications(response.data.notifications); // Save fetched schedules
                console.log("Frontend (Admin): Scheduled events fetched from database.");
            } else {
                console.error("Failed to fetch scheduled events:", response.data.message);
                setNotifications(loadAdminNotifications()); // Fallback to localStorage
            }
        } catch (error) {
            console.error("Error fetching scheduled events from backend:", error);
            setNotifications(loadAdminNotifications()); // Fallback to localStorage
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, loadAdminNotifications, saveAdminNotifications]); // Dependencies for fetchSchedules

    // Effect hook to fetch data on component mount and set up polling
    useEffect(() => {
        fetchSchedules();
        const pollInterval = setInterval(fetchSchedules, 30000); // Poll every 30 seconds
        return () => clearInterval(pollInterval); // Cleanup on unmount
    }, [fetchSchedules]);

    // Effect hook to save notifications to localStorage whenever 'notifications' state changes
    useEffect(() => {
        if (!loading) {
            saveAdminNotifications(notifications);
            console.log("Frontend (Admin): Schedules saved to localStorage.");
        }
    }, [notifications, loading, saveAdminNotifications]);

    // Handler functions (simplified as mark as read/delete behavior for schedules might be different)
    const markAsRead = (id) => {
        // For schedules, you might just want to set 'read' to true locally
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(n => n.id === id ? { ...n, read: true } : n);
            return updated;
        });
        // TODO: If you want to persist 'read' status for events, you'll need a backend endpoint to update it.
    };

    const deleteNotification = async (id) => {
        // Determine if it's a regular notification or a mapped event
        if (id.startsWith('event_')) {
            const eventId = id.replace('event_', '');
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/admin/events/${eventId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(`Event ${eventId} deleted from DB.`);
                fetchSchedules(); // Re-fetch to update the list
            } catch (error) {
                console.error(`Error deleting event ${eventId}:`, error.response?.data || error.message);
                alert(`Failed to delete event: ${error.response?.data?.message || 'Server error.'}`);
            }
        } else {
            // TODO: If this page handles other notification types later, add their delete logic here.
            setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
            console.log("Frontend (Admin): Deleted notification (local only for now).", id);
        }
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteAllNotifications = async () => {
        // This will delete ALL schedules currently displayed.
        // Needs a backend endpoint to delete all events or filter by some criteria.
        try {
            const token = localStorage.getItem('token');
            const eventIdsToDelete = notifications.filter(n => n.type === 'schedule' && n.id.startsWith('event_')).map(n => n.related_id); // Use related_id for actual event ID

            if (eventIdsToDelete.length > 0) {
                 await axios.post(`${API_BASE_URL}/api/admin/events/delete-multiple`, { eventIds: eventIdsToDelete }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("All scheduled events deleted from DB.");
                setNotifications([]); // Clear locally
            } else {
                setNotifications([]); // If no schedules, just clear locally
            }
        } catch (error) {
            console.error("Error deleting all scheduled events:", error.response?.data || error.message);
            alert(`Failed to delete all events: ${error.response?.data?.message || 'Server error.'}`);
        }
    };


    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={`notifications-container bg-${theme}-background text-${theme}-text`}>
            <div className="notifications-wrapper">
                <div className="notifications-header">
                    <h1 className={`notifications-title ${theme}-text`}>
                        Scheduled Events
                    </h1> {/* Changed title */}
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
                    <div className={`loading-text text-${theme}-secondary-text`}>Loading scheduled events...</div>
                ) : notifications.length === 0 ? (
                    <div className={`no-notifications-text text-${theme}-secondary-text italic`}>No scheduled events available.</div>
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

const AdminNotif = () => {
    return (
        <div className="Notifpage">
            <Sidebar />
            <div className="Notifpage-content">
                <AdminNotificationsPage />
            </div>
        </div>
    );
};

export default AdminNotif;