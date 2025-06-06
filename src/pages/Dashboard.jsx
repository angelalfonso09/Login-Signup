// Dashboard.js (updated with robust filtering and delete function)

import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Assuming Navbar exists and is used elsewhere
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/Dashboard.module.css";
import { ThemeContext } from "../context/ThemeContext";
import DashboardPage from "../components/DashboardPage"; // This component holds the total stats
import EstablishmentSensors from "../components/DashboardEstablishment"; // This component displays individual establishment cards
import CalendarComponent from "../components/CalendarComponent"; // Import Calendar Component

const Dashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEstablishmentName, setNewEstablishmentName] = useState("");
  const [establishments, setEstablishments] = useState([]); // Now stores full establishment objects
  const [loading, setLoading] = useState(true); // Add loading state
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [availableSensors, setAvailableSensors] = useState([]); // New state for available sensors
  const [selectedSensors, setSelectedSensors] = useState([]); // New state for selected sensors

  // --- Helper Function to Generate Device ID ---
  const generateDeviceId = () => {
    // Generates a random 5-digit number as a string
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // --- Database Interaction ---

  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/establishments');
      console.log('Frontend - HTTP Response Status:', response.status); // Log status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Frontend - HTTP Error fetching establishments:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }
      const data = await response.json();
      console.log('Frontend - Data received from backend:', data); // <--- THIS IS KEY!
      setEstablishments(data);
    } catch (error) {
      console.error("Frontend - Failed to fetch establishments (catch block):", error);
      setEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSensors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sensors');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableSensors(data); // Assuming the API returns an array of sensor objects [{id: N, name: 'Sensor Name'}, ...]
    } catch (error) {
      console.error("Failed to fetch available sensors:", error);
      setAvailableSensors([]);
    }
  };

  const addEstablishmentToDatabase = async (name, sensors, deviceId) => { // Added deviceId parameter
    try {
      const response = await fetch('http://localhost:5000/api/establishments', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Include selected sensors and the generated deviceId in the payload
        body: JSON.stringify({ name, sensors, device_id: deviceId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding establishment:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }
      const responseData = await response.json();
      console.log('Establishment added successfully:', responseData);
      await fetchEstablishments(); // Refresh the list after adding
    } catch (error) {
      console.error("Failed to add establishment:", error);
      // You might want to show a user-friendly error message here
    }
  };

  // --- NEW: Function to delete an establishment ---
  const handleDeleteEstablishment = async (establishmentId, establishmentName) => {
    // Implement a custom confirmation dialog here instead of `confirm()`
    const isConfirmed = window.confirm(`Are you sure you want to delete "${establishmentName}"? This action cannot be undone.`);

    if (!isConfirmed) {
      return; // User cancelled the deletion
    }

    try {
      const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error deleting establishment ${establishmentId}:`, response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
      }

      console.log(`Establishment ${establishmentId} deleted successfully.`);
      // Refresh the list after deletion
      await fetchEstablishments();
    } catch (error) {
      console.error("Failed to delete establishment:", error);
      // Show error message to user, e.g., with a toast or modal
    }
  };


  // --- Effect Hooks ---

  // Fetch establishments when the component mounts
  useEffect(() => {
    fetchEstablishments();
  }, []);

  // Fetch available sensors when the add form is shown
  useEffect(() => {
    if (showAddForm) {
      fetchAvailableSensors();
    }
  }, [showAddForm]);

  // --- Event Handlers ---

  const handleAddButtonClick = () => {
    setShowAddForm(true);
    setSelectedSensors([]); // Clear previously selected sensors
  };

  const handleInputChange = (event) => {
    setNewEstablishmentName(event.target.value);
  };

  const handleSensorCheckboxChange = (sensorId) => {
    setSelectedSensors((prevSelectedSensors) =>
      prevSelectedSensors.includes(sensorId)
        ? prevSelectedSensors.filter((id) => id !== sensorId)
        : [...prevSelectedSensors, sensorId]
    );
  };

  const handleAddEstablishment = async () => {
    if (newEstablishmentName.trim() !== "") {
      const newDeviceId = generateDeviceId(); // Generate the device ID
      // Add to the database, including selected sensors and the generated device ID
      await addEstablishmentToDatabase(newEstablishmentName, selectedSensors, newDeviceId);
      setNewEstablishmentName("");
      setSelectedSensors([]); // Clear selected sensors after adding
      setShowAddForm(false);
    } else {
      // Use a custom modal or toast for alerts, not `alert()`
      console.warn("Please enter an establishment name.");
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEstablishmentName("");
    setSelectedSensors([]); // Clear selected sensors on cancel
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // --- Filtered Establishments ---
  // Filter by establishment.name, with a robust check for undefined/null establishments
  const filteredEstablishments = establishments.filter((establishment) => {
    // Ensure 'establishment' is a valid object and has a 'name' property
    if (!establishment || typeof establishment.name !== 'string') {
      return false; // Exclude this item if it's not a valid establishment object
    }
    return establishment.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  console.log('Dashboard - Current establishments state:', establishments);
  console.log('Dashboard - Filtered establishments (before render):', filteredEstablishments);

  return (
    <div className={`${styles.db} ${theme}`}>
      <div className={styles.dbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.dbContents}>
          {/* Dashboard Metrics Section */}
          <div className={styles.meterRowFlex}>
            <DashboardPage />
          </div>

          {/* Main Content Area: Establishments List and Calendar */}
          <div className={styles.mainContentGrid}>
            {/* Establishment Management Section */}
            <div className={styles.establishmentSection}>
              <div className={styles.sectionHeader}>
                <h3>Establishments</h3>
                {!showAddForm && (
                  <button onClick={handleAddButtonClick} className={styles.addEstablishmentButton}>
                    + Add New Establishment
                  </button>
                )}
              </div>
              {showAddForm && (
                <div className={styles.addEstablishmentForm}>
                  <input
                    type="text"
                    placeholder="Enter establishment name"
                    value={newEstablishmentName}
                    onChange={handleInputChange}
                  />
                  {availableSensors.length > 0 && (
                    <div className={styles.sensorSelection}>
                      <h4>Select Sensors:</h4>
                      {availableSensors.map((sensor) => (
                        <div key={sensor.id} className={styles.sensorCheckboxItem}>
                          <input
                            type="checkbox"
                            id={`sensor-${sensor.id}`}
                            value={sensor.id} // Set value to sensor.id
                            checked={selectedSensors.includes(sensor.id)}
                            onChange={() => handleSensorCheckboxChange(sensor.id)}
                          />
                          <label htmlFor={`sensor-${sensor.id}`}>{sensor.sensor_name}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {availableSensors.length === 0 && (
                    <div className={styles.noSensorsMessage}>No sensors available to add.</div>
                  )}
                  <div className={styles.formButtons}>
                    <button onClick={handleAddEstablishment} className={styles.addButton}>Add</button>
                    <button onClick={handleCancelAdd} className={styles.cancelButton}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className={styles.searchBarContainer}>
                <input
                  type="text"
                  placeholder="Search establishments..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchBar}
                />
              </div>

              <div className={styles.establishmentsList}>
                {loading ? (
                  <div className={styles.loadingMessage}>Loading establishments...</div>
                ) : filteredEstablishments.length === 0 ? (
                  <div className={styles.noEstablishmentsMessage}>No establishments found matching your search.</div>
                ) : (
                  // Pass the entire establishment object to EstablishmentSensors
                  filteredEstablishments.map((establishment) => (
                    <EstablishmentSensors
                      key={establishment.id}
                      establishment={establishment}
                      // Pass the delete function as a prop
                      onDelete={handleDeleteEstablishment} // <--- NEW PROP
                    />
                  ))
                )}
              </div>
            </div>

            {/* Calendar Section */}
            <div className={styles.calendarSection}>
              <CalendarComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;