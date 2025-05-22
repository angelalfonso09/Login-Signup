import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/Dashboard.module.css";
import { ThemeContext } from "../context/ThemeContext";
import DashboardPage from "../components/DashboardPage";
import EstablishmentSensors from "../components/DashboardEstablishment";

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
      const response = await fetch('http://localhost:5000/api/establishments');  //  Endpoint
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
          <div className={styles.meterRowFlex}>
            <DashboardPage />
            <div className={styles.establishmentSection}>
              <div className={styles.addEstablishmentContainer}>
                {!showAddForm && (
                  <button onClick={handleAddButtonClick}>Add Establishment</button>
                )}
                {showAddForm && (
                  <div className={styles.addEstablishmentForm}>
                    <input
                      type="text"
                      placeholder="Establishment Name"
                      value={newEstablishmentName}
                      onChange={handleInputChange}
                    />
                    <div className={styles.formButtons}>
                      <button onClick={handleAddEstablishment}>Add</button>
                      <button onClick={handleCancelAdd}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.establishmentsList}>
                {loading ? (
                  <div>Loading establishments...</div> //  Loading message
                ) : establishments.length === 0 ? (
                  <div>No establishments found.</div>
                ) : (
                  establishments.map((establishmentName, index) => (
                    <EstablishmentSensors key={index} establishmentName={establishmentName} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
