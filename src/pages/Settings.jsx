import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import { 
  ChevronRight, ChevronDown, User, Lock, Bell, Sun, Moon, History, 
  Save, Edit, KeyRound, LogIn, LogOut, AlertCircle, Mail, Phone,
  Clock, Monitor, Globe
} from 'lucide-react';
import axios from 'axios';
import PageTitle from "../components/PageTitle";

// Import the CSS files
import '../styles/Pages Css/Settings.css';
import '../styles/Pages Css/Settings-improved.css';

// Define your backend API base URL
// Ensure this matches the port your Node.js backend is running on (default: 5000)
const API_BASE_URL = 'https://login-signup-3470.onrender.com/api';

const SettingsPage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [sessionHistory, setSessionHistory] = useState([]);

  // State to manage open/closed status of each main section
  const [openSection, setOpenSection] = useState(null); // 'profile', 'appearance', 'session'

  // States to manage the visibility of nested forms within Profile Management
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  // Load user data and session history from localStorage on component mount
  useEffect(() => {
    // In a real application, the initial user data would be fetched from the backend
    // after a successful login. For this example, we still load from localStorage
    // to populate the fields initially.
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const currentUser = JSON.parse(userString);
        setUsername(currentUser.username || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
        setReceiveNotifications(currentUser.receiveNotifications !== undefined ? currentUser.receiveNotifications : true);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }

    // Load session history
    const storedSessionHistory = localStorage.getItem('sessionHistory');
    if (storedSessionHistory) {
      try {
        setSessionHistory(JSON.parse(storedSessionHistory));
      } catch (e) {
        console.error("Error parsing session history from localStorage:", e);
      }
    }
  }, []);

  // Function to save session history to localStorage
  const saveSessionHistory = (history) => {
    localStorage.setItem('sessionHistory', JSON.stringify(history));
    setSessionHistory(history);
  };

  // Function to log a session event (login/logout)
  const logSessionEvent = (type, username) => {
    const newEntry = {
      id: Date.now(), // Unique ID for the entry
      username: username,
      type: type, // 'login' or 'logout'
      timestamp: new Date().toLocaleString(),
      device: "Mock Device (e.g., Desktop Chrome)", // You can try to get actual device info
      ipAddress: "Mock IP (e.g., 192.168.1.1)" // You can try to get actual IP (requires backend)
    };
    const updatedHistory = [...sessionHistory, newEntry];
    saveSessionHistory(updatedHistory);
  };

  // Example: Call logSessionEvent on initial load for a "mock login" if a user is present
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString && username) { // Only log if user data is loaded and username is set
      logSessionEvent('login', username);
    }
  }, [username]); // Depend on username to ensure it's loaded

  // Function to simulate user logout
  const handleLogout = () => {
    if (username) {
      logSessionEvent('logout', username);
      // In a real app, you'd clear user session, redirect to login, etc.
      localStorage.removeItem('user');
      setUsername('');
      setEmail('');
      setPhone('');
      setMessage('You have been logged out (mock).');
      setMessageType('success');
    }
  };

  // Function to toggle main section visibility
  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
    // When a main section is closed, hide its nested forms
    if (openSection === sectionName) {
      setShowEditProfileForm(false);
      setShowChangePasswordForm(false);
    }
  };

  // Function to handle saving profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // --- NEW: Get the authentication token ---
    const token = localStorage.getItem('token'); // Assuming you store your JWT here after login
    if (!token) {
        setMessage('You are not logged in. Please log in first.');
        setMessageType('error');
        return;
    }
    // --- END NEW ---

    try {
      // Send data to the backend API with Authorization header
      const response = await axios.put(`${API_BASE_URL}/super-admin/profile`,
        { username, email, phone },
        {
          headers: {
            Authorization: `Bearer ${token}` // Send the token with 'Bearer' prefix
          }
        }
      );

      // Update frontend state with confirmed data from backend
      const updatedUser = response.data.user;
      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setPhone(updatedUser.phone);
      setReceiveNotifications(updatedUser.receive_notifications);

      setMessage(response.data.message);
      setMessageType('success');

      // Update localStorage to reflect the changes confirmed by the backend
      const userString = localStorage.getItem('user');
      if (userString) {
        let currentUser = JSON.parse(userString);
        currentUser = {
          ...currentUser,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          receiveNotifications: updatedUser.receive_notifications
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
      }

      setShowEditProfileForm(false); // Hide form after successful save
    } catch (error) {
      console.error("Error saving profile:", error);
      // Check for specific error messages from the backend
      if (error.response) {
          if (error.response.status === 401) {
              setMessage(error.response.data.message || 'Unauthorized. Please log in again.');
          } else if (error.response.status === 400) {
              setMessage(error.response.data.message || 'Invalid input for profile update.');
          } else if (error.response.status === 409) { // Added for conflict (username/email in use)
              setMessage(error.response.data.message || 'Username or email already in use.');
          } else {
              setMessage(error.response.data.message || 'Failed to update profile due to a server error.');
          }
      } else if (error.request) {
          setMessage('No response from server. Check your internet connection.');
      } else {
          setMessage('Error setting up request to update profile.');
      }
      setMessageType('error');
    }
  };

  // Function to handle changing password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // --- NEW: Get the authentication token ---
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage('You are not logged in. Please log in first.');
        setMessageType('error');
        return;
    }
    // --- END NEW ---

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage('All password fields are required.');
      setMessageType('error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage('New password and confirm password do not match.');
      setMessageType('error');
      return;
    }
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters long.');
      setMessageType('error');
      return;
    }

    try {
      // Send data to the backend API with Authorization header
      const response = await axios.post(`${API_BASE_URL}/super-admin/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}` // Send the token with 'Bearer' prefix
          }
        }
      );

      setMessage(response.data.message);
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePasswordForm(false); // Hide form after successful change
    } catch (error) {
      console.error("Error changing password:", error);
      // Check for specific error messages from the backend
      if (error.response) {
          if (error.response.status === 401) {
              setMessage(error.response.data.message || 'Unauthorized. Incorrect current password or session expired. Please log in again.');
          } else if (error.response.status === 400) {
              setMessage(error.response.data.message || 'Invalid input for password change.');
          } else if (error.response.status === 404) {
              setMessage(error.response.data.message || 'User not found. This should not happen if logged in.');
          } else {
              setMessage(error.response.data.message || 'Failed to change password due to a server error.');
          }
      } else if (error.request) {
          setMessage('No response from server. Check your internet connection.');
      } else {
          setMessage('Error setting up request to change password.');
      }
      setMessageType('error');
    }
  };

  // Function to handle notification preference change
  const handleToggleNotifications = async () => {
    const newPreference = !receiveNotifications;
    setReceiveNotifications(newPreference); // Optimistic update

    setMessage('');
    setMessageType('');

    // --- NEW: Get the authentication token ---
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage('You are not logged in. Please log in first.');
        setMessageType('error');
        setReceiveNotifications(!newPreference); // Revert optimistic update immediately
        return;
    }
    // --- END NEW ---

    try {
      // Send data to the backend API with Authorization header
      const response = await axios.put(`${API_BASE_URL}/super-admin/notifications`,
        { receiveNotifications: newPreference },
        {
          headers: {
            Authorization: `Bearer ${token}` // Send the token with 'Bearer' prefix
          }
        }
      );

      // Confirm update from backend response
      setMessage(response.data.message);
      setMessageType('success');

      // Update localStorage with new notification preference
      const userString = localStorage.getItem('user');
      if (userString) {
        let currentUser = JSON.parse(userString);
        currentUser = { ...currentUser, receiveNotifications: newPreference };
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      if (error.response) {
          if (error.response.status === 401) {
              setMessage(error.response.data.message || 'Unauthorized. Please log in again.');
          } else if (error.response.status === 400) {
              setMessage(error.response.data.message || 'Invalid input for notification preference.');
          } else {
              setMessage(error.response.data.message || 'Failed to update notification preference due to a server error.');
          }
      } else if (error.request) {
          setMessage('No response from server. Check your internet connection.');
      } else {
          setMessage('Error setting up request to update notification preference.');
      }
      setMessageType('error');
      setReceiveNotifications(!newPreference); // Revert optimistic update on failure
    }
  };


  return (
    <div className={`settings-page-container ${theme}-theme`}>
      <Sidebar />
      <div className="settings-page-content-wrapper">
        <PageTitle title="SETTINGS" />
        <div className="settings-page-dashboard">

          {message && (
            <div className={`settings-page-message-box ${messageType === 'success' ? 'settings-page-message-success' : 'settings-page-message-error'}`}>
              {messageType === 'success' ? (
                <div className="settings-page-message-content">
                  <Save size={20} className="settings-page-message-icon" />
                  <span>{message}</span>
                </div>
              ) : (
                <div className="settings-page-message-content">
                  <AlertCircle size={20} className="settings-page-message-icon" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          )}

          {/* Profile Management Section */}
          <section className="settings-page-section-card">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('profile')}>
              <div className="settings-page-header-content">
                <User size={24} className="settings-page-category-icon" />
                <span>Profile Management</span>
              </div>
              {openSection === 'profile' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">Manage your personal information and account security.</p>
            {openSection === 'profile' && (
              <div className="settings-page-form-wrapper">
                {/* Edit Profile Item */}
                <div className="settings-page-list-item" onClick={() => { setShowEditProfileForm(!showEditProfileForm); setShowChangePasswordForm(false); }}>
                  <div className="settings-page-item-inner">
                    <div className="settings-page-item-content">
                      <Edit size={20} className="settings-page-item-icon" />
                      <span className="settings-page-item-text">Edit Profile</span>
                    </div>
                    <div className="settings-page-item-action">
                      {showEditProfileForm ? <ChevronDown size={20} className="settings-page-item-arrow" /> : <ChevronRight size={20} className="settings-page-item-arrow" />}
                    </div>
                  </div>
                </div>
                {/* Content for Edit Profile (Form) */}
                {showEditProfileForm && (
                  <form onSubmit={handleSaveProfile} className="settings-page-nested-form">
                    <div className="settings-page-form-grid">
                      <div className="settings-page-form-group">
                        <label htmlFor="username" className="settings-page-form-label">Username</label>
                        <div className="settings-page-input-container">
                          <User size={18} className="settings-page-input-icon" />
                          <input
                            type="text"
                            id="username"
                            className="settings-page-input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            required
                          />
                        </div>
                      </div>
                      <div className="settings-page-form-group">
                        <label htmlFor="email" className="settings-page-form-label">Email</label>
                        <div className="settings-page-input-container">
                          <Mail size={18} className="settings-page-input-icon" />
                          <input
                            type="email"
                            id="email"
                            className="settings-page-input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="settings-page-form-group">
                        <label htmlFor="phone" className="settings-page-form-label">Phone</label>
                        <div className="settings-page-input-container">
                          <Phone size={18} className="settings-page-input-icon" />
                          <input
                            type="tel"
                            id="phone"
                            className="settings-page-input-field"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g., +1234567890"
                          />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="settings-page-button settings-page-button-primary">
                      <Save size={20} className="settings-page-button-icon" /> Save Profile
                    </button>
                  </form>
                )}

                {/* Change Password Item */}
                <div className="settings-page-list-item" onClick={() => { setShowChangePasswordForm(!showChangePasswordForm); setShowEditProfileForm(false); }}>
                  <div className="settings-page-item-inner">
                    <div className="settings-page-item-content">
                      <KeyRound size={20} className="settings-page-item-icon" />
                      <span className="settings-page-item-text">Change Password</span>
                    </div>
                    <div className="settings-page-item-action">
                      {showChangePasswordForm ? <ChevronDown size={20} className="settings-page-item-arrow" /> : <ChevronRight size={20} className="settings-page-item-arrow" />}
                    </div>
                  </div>
                </div>
                {/* Content for Change Password (Form) */}
                {showChangePasswordForm && (
                  <form onSubmit={handleSavePassword} className="settings-page-nested-form">
                    <div className="settings-page-form-grid">
                      <div className="settings-page-form-group">
                        <label htmlFor="currentPassword" className="settings-page-form-label">Current Password</label>
                        <div className="settings-page-input-container">
                          <Lock size={18} className="settings-page-input-icon" />
                          <input
                            type="password"
                            id="currentPassword"
                            className="settings-page-input-field"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                      </div>
                      <div className="settings-page-form-group">
                        <label htmlFor="newPassword" className="settings-page-form-label">New Password</label>
                        <div className="settings-page-input-container">
                          <KeyRound size={18} className="settings-page-input-icon" />
                          <input
                            type="password"
                            id="newPassword"
                            className="settings-page-input-field"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                      </div>
                      <div className="settings-page-form-group">
                        <label htmlFor="confirmNewPassword" className="settings-page-form-label">Confirm New Password</label>
                        <div className="settings-page-input-container">
                          <KeyRound size={18} className="settings-page-input-icon" />
                          <input
                            type="password"
                            id="confirmNewPassword"
                            className="settings-page-input-field"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="settings-page-password-requirements">
                      <p><AlertCircle size={16} className="settings-page-info-icon" /> Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.</p>
                    </div>
                    <button type="submit" className="settings-page-button settings-page-button-primary">
                      <Save size={20} className="settings-page-button-icon" /> Change Password
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>

          {/* Appearance Section */}
          <section className="settings-page-section-card">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('appearance')}>
              <div className="settings-page-header-content">
                {theme === 'dark' ? <Moon size={24} className="settings-page-category-icon" /> : <Sun size={24} className="settings-page-category-icon" />}
                <span>Appearance</span>
              </div>
              {openSection === 'appearance' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">Customize the look and feel of the application.</p>
            {openSection === 'appearance' && (
              <div className="settings-page-form-wrapper">
                {/* Theme Toggle Item */}
                <div className="settings-page-theme-toggle">
                  <div className={`settings-page-theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => theme !== 'light' && toggleTheme()}>
                    <Sun size={28} className={`settings-page-theme-icon ${theme === 'light' ? 'active' : ''}`} />
                    <span className={`settings-page-theme-label ${theme === 'light' ? 'active' : ''}`}>Light Mode</span>
                  </div>
                  
                  <label htmlFor="themeToggle" className="settings-page-switch-container">
                    <input
                      type="checkbox"
                      id="themeToggle"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      className="settings-page-theme-checkbox"
                    />
                    <span className="settings-page-slider settings-page-round"></span>
                  </label>
                  
                  <div className={`settings-page-theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme !== 'dark' && toggleTheme()}>
                    <Moon size={28} className={`settings-page-theme-icon ${theme === 'dark' ? 'active' : ''}`} />
                    <span className={`settings-page-theme-label ${theme === 'dark' ? 'active' : ''}`}>Dark Mode</span>
                  </div>
                </div>
                
                {/* Uncomment this if you want to re-enable notification preferences */}
                {/* <div className="settings-page-list-item settings-page-toggle-item">
                  <div className="settings-page-item-content">
                    <Bell size={20} className="settings-page-item-icon" />
                    <span className="settings-page-item-text">Receive Notifications</span>
                  </div>
                  <label htmlFor="notificationToggle" className="settings-page-switch-label">
                    <input
                      type="checkbox"
                      id="notificationToggle"
                      checked={receiveNotifications}
                      onChange={handleToggleNotifications}
                    />
                    <span className="settings-page-slider settings-page-round"></span>
                  </label>
                </div> */}
              </div>
            )}
          </section>

          {/* Session History Section */}
          <section className="settings-page-section-card">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('session')}>
              <div className="settings-page-header-content">
                <History size={24} className="settings-page-category-icon" />
                <span>Session History</span>
              </div>
              {openSection === 'session' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">View your login and logout sessions.</p>
            {openSection === 'session' && (
              <div className="settings-page-form-wrapper">
                <div className="settings-page-session-history">
                  {sessionHistory.length > 0 ? (
                    <div className="settings-page-session-list">
                      {sessionHistory.map((session) => (
                        <div key={session.id} className="settings-page-session-item">
                          <div className={`settings-page-session-icon ${session.type === 'login' ? 'login-icon' : 'logout-icon'}`}>
                            {session.type === 'login' ? (
                              <LogIn size={20} className="settings-page-login-icon" />
                            ) : (
                              <LogOut size={20} className="settings-page-logout-icon" />
                            )}
                          </div>
                          <div className="settings-page-session-details">
                            <div className="settings-page-session-main-info">
                              <span className="settings-page-session-username">{session.username}</span>
                              <span className="settings-page-session-action">
                                {session.type === 'login' ? 'Logged in' : 'Logged out'}
                              </span>
                            </div>
                            <div className="settings-page-session-secondary-info">
                              <span className="settings-page-session-time">
                                <Clock size={14} className="settings-page-session-info-icon" /> {session.timestamp}
                              </span>
                              <span className="settings-page-session-device">
                                <Monitor size={14} className="settings-page-session-info-icon" /> {session.device}
                              </span>
                              <span className="settings-page-session-ip">
                                <Globe size={14} className="settings-page-session-info-icon" /> IP: {session.ipAddress}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="settings-page-no-sessions">
                      <History size={48} className="settings-page-no-data-icon" />
                      <p>No session history available.</p>
                      <button className="settings-page-button settings-page-button-secondary" onClick={() => logSessionEvent('login', username || 'Test User')}>
                        Generate Test Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
