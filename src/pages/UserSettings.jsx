import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import { ChevronRight, ChevronDown, User, Lock, Bell, Sun, Moon, Save, Edit, KeyRound } from 'lucide-react'; // Removed History, LogIn, LogOut icons
import axios from 'axios';

// Import the new CSS file
import '../styles/Pages Css/Settings.css';

const UserSettingsPage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  // Removed `Maps` as it was only used for a removed logout function
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Removed sessionHistory state
  // const [sessionHistory, setSessionHistory] = useState([]);

  // State to manage open/closed status of each section
  const [openSection, setOpenSection] = useState(null); // 'profile', 'appearance' (removed 'session')

  // Load user data from localStorage on component mount
  useEffect(() => {
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
    // Removed session history loading
  }, []); // Empty dependency array means this runs once on mount

  // Removed saveSessionHistory function
  // const saveSessionHistory = (history) => {
  //   localStorage.setItem('sessionHistory', JSON.stringify(history));
  //   setSessionHistory(history);
  // };

  // Removed logSessionEvent function
  // const logSessionEvent = (type, username) => {
  //   const newEntry = {
  //     id: Date.now(),
  //     username: username,
  //     type: type,
  //     timestamp: new Date().toLocaleString(),
  //     device: "Mock Device (e.g., Desktop Chrome)",
  //     ipAddress: "Mock IP (e.g., 192.168.1.1)"
  //   };
  //   const updatedHistory = [...sessionHistory, newEntry];
  //   saveSessionHistory(updatedHistory);
  // };

  // Removed useEffect for mock login event

  // Removed handleLogout function (it's handled by Sidebar)

  // Function to toggle section visibility
  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  // Function to handle saving profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    try {
      // In a real app, you'd send this data to your backend
      // const response = await axios.put('/api/user/profile', { username, email, phone });
      // Update local storage only if backend call is successful
      setMessage('Profile updated successfully (mock)!');
      setMessageType('success');
      const userString = localStorage.getItem('user');
      if (userString) {
        let currentUser = JSON.parse(userString);
        currentUser = { ...currentUser, username, email, phone };
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage('Failed to update profile due to a server error.');
      setMessageType('error');
    }
  };

  // Function to handle changing password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

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
      // In a real app, you'd send this data to your backend
      // const response = await axios.put('/api/user/change-password', { currentPassword, newPassword });
      setMessage('Password changed successfully (mock)!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage('Failed to change password due to a server error.');
      setMessage('Failed to change password due to a server error.');
      setMessageType('error');
    }
  };

  // Function to handle notification preference change
  const handleToggleNotifications = async () => {
    const newPreference = !receiveNotifications;
    setReceiveNotifications(newPreference);
    setMessage('');
    setMessageType('');

    try {
      // In a real app, you'd send this data to your backend
      // const response = await axios.put('/api/user/notification-preference', { receiveNotifications: newPreference });
      setMessage('Notification preference updated (mock)!');
      setMessageType('success');
      const userString = localStorage.getItem('user');
      if (userString) {
        let currentUser = JSON.parse(userString);
        currentUser = { ...currentUser, receiveNotifications: newPreference };
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Error updating notification preference:", error);
      setMessage('Failed to update notification preference due to a server error.');
      setMessageType('error');
      setReceiveNotifications(!newPreference); // Revert on failure
    }
  };

  return (
    <div className={`settings-page-container ${theme}-theme`}>
      <Sidebar />
      <div className="settings-page-content-wrapper">
        <div className="settings-page-card-wrapper">
          <h1 className="settings-page-main-title">Settings</h1>

          {message && (
            <div className={`settings-page-message-box ${messageType === 'success' ? 'settings-page-message-success' : 'settings-page-message-error'}`}>
              {message}
            </div>
          )}

          {/* Profile Management Section */}
          <section className="settings-page-section-category">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('profile')}>
              <User size={24} className="settings-page-category-icon" />
              Profile Management
              {openSection === 'profile' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">Manage your personal information and account security.</p>
            {openSection === 'profile' && (
              <div className="settings-page-form-wrapper">
                {/* Edit Profile Item */}
                <div className="settings-page-list-item" onClick={() => console.log('Edit Profile Clicked')}>
                  <div className="settings-page-item-content">
                    <Edit size={20} className="settings-page-item-icon" />
                    <span className="settings-page-item-text">Edit Profile</span>
                  </div>
                  <ChevronRight size={20} className="settings-page-item-arrow" />
                </div>
                {/* Content for Edit Profile (Form) - displayed directly for now */}
                <form onSubmit={handleSaveProfile} className="settings-page-nested-form">
                  <div className="settings-page-form-group">
                    <label htmlFor="username">Username</label>
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
                  <div className="settings-page-form-group">
                    <label htmlFor="email">Email</label>
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
                  <div className="settings-page-form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      className="settings-page-input-field"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., +1234567890"
                    />
                  </div>
                  <button type="submit" className="settings-page-button settings-page-button-primary">
                    <Save size={20} className="settings-page-button-icon" /> Save Profile
                  </button>
                </form>

                {/* Change Password Item */}
                <div className="settings-page-list-item" onClick={() => console.log('Change Password Clicked')}>
                  <div className="settings-page-item-content">
                    <KeyRound size={20} className="settings-page-item-icon" />
                    <span className="settings-page-item-text">Change Password</span>
                  </div>
                  <ChevronRight size={20} className="settings-page-item-arrow" />
                </div>
                {/* Content for Change Password (Form) - displayed directly for now */}
                <form onSubmit={handleSavePassword} className="settings-page-nested-form">
                  <div className="settings-page-form-group">
                    <label htmlFor="currentPassword">Current Password</label>
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
                  <div className="settings-page-form-group">
                    <label htmlFor="newPassword">New Password</label>
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
                  <div className="settings-page-form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
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
                  <button type="submit" className="settings-page-button settings-page-button-primary">
                    <Save size={20} className="settings-page-button-icon" /> Change Password
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Appearance Section */}
          <section className="settings-page-section-category">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('appearance')}>
              {theme === 'dark' ? <Moon size={24} className="settings-page-category-icon" /> : <Sun size={24} className="settings-page-category-icon" />}
              Appearance
              {openSection === 'appearance' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">Customize the look and feel of the application.</p>
            {openSection === 'appearance' && (
              <div className="settings-page-form-wrapper">
                {/* Theme Toggle Item */}
                <div className="settings-page-list-item settings-page-toggle-item">
                  <div className="settings-page-item-content">
                    {theme === 'dark' ? <Moon size={20} className="settings-page-item-icon" /> : <Sun size={20} className="settings-page-item-icon" />}
                    <span className="settings-page-item-text">Dark Mode</span>
                  </div>
                  <label htmlFor="themeToggle" className="settings-page-switch-label">
                    <input
                      type="checkbox"
                      id="themeToggle"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <span className="settings-page-slider settings-page-round"></span>
                  </label>
                </div>
                {/* Notification Preference Item */}
                <div className="settings-page-list-item settings-page-toggle-item">
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
                </div>
              </div>
            )}
          </section>

          {/* Removed Session History Section */}
          {/*
          <section className="settings-page-section-category">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('session')}>
              <History size={24} className="settings-page-category-icon" />
              Session History
              {openSection === 'session' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">View your login and logout sessions.</p>
            {openSection === 'session' && (
              <div className="settings-page-form-wrapper">
                {sessionHistory.length > 0 ? (
                  sessionHistory.map((session) => (
                    <div key={session.id} className="settings-page-list-item">
                      <div className="settings-page-item-content">
                        {session.type === 'login' ? (
                          <LogIn size={20} className="settings-page-item-icon settings-page-login-icon" />
                        ) : (
                          <LogOut size={20} className="settings-page-item-icon settings-page-logout-icon" />
                        )}
                        <span className="settings-page-item-text">
                          <span style={{ fontWeight: 'bold' }}>{session.username}</span> {session.type === 'login' ? 'logged in' : 'logged out'} on {session.timestamp} from {session.device} (IP: {session.ipAddress})
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="settings-page-list-item">
                    <div className="settings-page-item-content">
                      <span className="settings-page-item-text">No session history available.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
          */}

        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;