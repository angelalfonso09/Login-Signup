import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import { ChevronRight, ChevronDown, User, Lock, Bell, Sun, Moon, History, Save, Edit, KeyRound } from 'lucide-react'; // Updated icons
import axios from 'axios';

// Import the new CSS file
import '../styles/Pages Css/Settings.css';

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

  // State to manage open/closed status of each section
  const [openSection, setOpenSection] = useState(null); // 'profile', 'appearance', 'session'

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
  }, []);

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
      setMessage('Password changed successfully (mock)!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error("Error changing password:", error);
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

          {/* Session History Section */}
          <section className="settings-page-section-category">
            <h2 className="settings-page-category-header" onClick={() => toggleSection('session')}>
              <History size={24} className="settings-page-category-icon" />
              Session History
              {openSection === 'session' ? <ChevronDown size={20} className="settings-page-toggle-icon" /> : <ChevronRight size={20} className="settings-page-toggle-icon" />}
            </h2>
            <p className="settings-page-category-description">View and manage your login sessions.</p>
            {openSection === 'session' && (
              <div className="settings-page-form-wrapper">
                {/* Example Session History Item */}
                <div className="settings-page-list-item">
                  <div className="settings-page-item-content">
                    <span className="settings-page-item-text">Last Login: May 29, 2025, 10:30 AM (Mock)</span>
                  </div>
                  <ChevronRight size={20} className="settings-page-item-arrow" />
                </div>
                <div className="settings-page-list-item">
                  <div className="settings-page-item-content">
                    <span className="settings-page-item-text">Device: Desktop Chrome (Mock)</span>
                  </div>
                  <ChevronRight size={20} className="settings-page-item-arrow" />
                </div>
                {/* Add more session history items here if needed */}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
