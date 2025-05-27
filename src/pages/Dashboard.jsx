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
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // --- Database Interaction (Simulated) ---
  // In a real application, these would be API calls to your backend.
  const fetchEstablishments = async () => {
    setLoading(true);
    try {
      // Simulate fetching data from a database (replace with actual API call)
      const response = await fetch('http://localhost:5000/api/establishments'); // Endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEstablishments(data); // Assuming the API returns an array of establishment names
    } catch (error) {
      console.error("Failed to fetch establishments:", error);
      // Handle error (e.g., show error message to user)
      setEstablishments([]); // Set to empty array to avoid errors
    } finally {
      setLoading(false);
    }
  };

  const addEstablishmentToDatabase = async (name) => {
    try {
      // Simulate sending data to a database (replace with actual API call)
      const response = await fetch('http://localhost:5000/api/establishments', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
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
      // Handle error (e.g., show error message to user)
    }
  };

  // --- Effect Hooks ---

  // Fetch establishments when the component mounts
  useEffect(() => {
    fetchEstablishments();
  }, []);

  // --- Event Handlers ---

  const handleAddButtonClick = () => {
    setShowAddForm(true);
  };

  const handleInputChange = (event) => {
    setNewEstablishmentName(event.target.value);
  };

  const handleAddEstablishment = async () => {
    if (newEstablishmentName.trim() !== "") {
      // Add to the database
      await addEstablishmentToDatabase(newEstablishmentName);
      setNewEstablishmentName("");
      setShowAddForm(false);
    } else {
      alert("Please enter an establishment name.");
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEstablishmentName("");
  };

  return (
    <div className={`${styles.db} ${theme}`}>
      <div className={styles.dbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.dbContents}>
          {/* Dashboard Metrics Section */}
          <div className={styles.meterRowFlex}>
            <DashboardPage /> {/* This component displays Total Establishments, Sensors, Users */}
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
                  <div className={styles.formButtons}>
                    <button onClick={handleAddEstablishment} className={styles.addButton}>Add</button>
                    <button onClick={handleCancelAdd} className={styles.cancelButton}>Cancel</button>
                  </div>
                </div>
              )}
              <div className={styles.establishmentsList}>
                {loading ? (
                  <div className={styles.loadingMessage}>Loading establishments...</div>
                ) : establishments.length === 0 ? (
                  <div className={styles.noEstablishmentsMessage}>No establishments found. Click '+ Add New Establishment' to add one.</div>
                ) : (
                  establishments.map((establishmentName, index) => (
                    <EstablishmentSensors key={index} establishmentName={establishmentName} />
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