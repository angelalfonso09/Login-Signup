// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // CHANGE 1: Use 'user' key for localStorage
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  // NEW STATE: userRole
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null; // Load role from localStorage
  });

  // Effect to update localStorage whenever currentUser or userRole changes
  useEffect(() => {
    if (currentUser) {
      // CHANGE 2: Use 'user' key when setting localStorage
      localStorage.setItem('user', JSON.stringify(currentUser));
      // Also update userRole in localStorage if currentUser changes
      if (currentUser.role) { // Assuming userData has a 'role' property
        localStorage.setItem('userRole', currentUser.role);
        setUserRole(currentUser.role); // Keep context state in sync
      }
    } else {
      // CHANGE 3: Use 'user' key when removing from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('userRole'); // Clear role on logout
      setUserRole(null); // Clear context state on logout
    }
  }, [currentUser]);

  // Function to handle user login
  const login = (userData, token) => {
    setCurrentUser(userData);
    localStorage.setItem('token', token); // Store the JWT

    // IMPORTANT: Set the userRole in localStorage and context state here
    if (userData && userData.role) {
      localStorage.setItem('userRole', userData.role);
      setUserRole(userData.role);
    } else {
      localStorage.removeItem('userRole');
      setUserRole(null);
    }
  };

  // Function to handle user logout
  const logout = () => {
    setCurrentUser(null);
    setUserRole(null); // Clear user role on logout
    localStorage.removeItem('token');
    // CHANGE 4: Use 'user' key when removing from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole'); // Ensure userRole is also cleared
  };

  // Function to get the JWT
  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    // Expose userRole from AuthContext
    <AuthContext.Provider value={{ currentUser, userRole, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};