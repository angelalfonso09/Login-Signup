import React, { useContext, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/adminDB.module.css";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import AdminDashboardPage from "../components/AdminDashboardPage";
import EstablishmentSensors from "../components/DashboardEstablishment";
import Calendar from "../components/CalendarComponent";

const AdminDb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser, getToken } = useContext(AuthContext); // Access currentUser and getToken

  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEstablishments = async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // --- FIX APPLIED HERE: Corrected typo in the URL ---
      // Changed 'assi_ed-establishments' to 'assigned-establishments'
      const response = await fetch(`http://localhost:5000/api/admin/assigned-establishments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the JWT
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error from server.' }));
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      // Log the data to inspect its structure
      console.log("AdminDb - Data received from backend for assigned establishments:", data);
      setEstablishments(data);
    } catch (err) {
      console.error("AdminDb - Failed to fetch establishments:", err);
      setError(`Failed to load assigned establishments: ${err.message}. Please ensure you are logged in as an Admin/Super Admin.`);
      setEstablishments([]); // Clear establishments on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch establishments if a user is authenticated (currentUser is not null)
    if (currentUser) {
      fetchEstablishments();
    } else {
      // If no currentUser, stop loading and inform the user
      setLoading(false);
      setError("Please log in to view assigned establishments.");
      setEstablishments([]); // Ensure establishments state is empty
    }
  }, [currentUser]); // Dependency array ensures this effect re-runs if currentUser changes

  // Function to handle deletion (similar to Dashboard.js, but ensures admin context)
  const handleDeleteEstablishment = async (establishmentId, establishmentName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${establishmentName}"? This action cannot be undone.`);

    if (!isConfirmed) {
      return;
    }

    try {
      const token = getToken(); // Get the token for deletion
      if (!token) {
        throw new Error("Authentication token missing for delete operation.");
      }

      const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}` // Send the JWT
        },
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
      setError(`Failed to delete establishment: ${error.message}`);
    }
  };


  return (
    <div className={`${styles.admindb} ${theme}`}>
      {/* <Navbar theme={theme} toggleTheme={toggleTheme} /> */}
      <div className={styles.admindbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.admindbContents}>
          <div className={styles.mainMetrics}>
            <AdminDashboardPage />
          </div>

          <div className={styles.mainContentGrid}>
            <div className={styles.establishmentSection}>
              <h2>Assigned Establishments</h2>
              {loading && <p>Loading assigned establishments...</p>}
              {error && <p className={styles.errorMessage}>{error}</p>}
              {!loading && !error && establishments.length === 0 && (
                <p>No establishments assigned to this admin yet, or user not logged in as Admin.</p>
              )}
              <div className={styles.establishmentCards}>
                {establishments.map((establishment) => {
                  return (
                    <EstablishmentSensors
                      key={establishment.id}
                      establishment={establishment}
                      onDelete={handleDeleteEstablishment}
                    />
                  );
                })}
              </div>
            </div>

            <div className={styles.calendarSection}>
              <Calendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDb;
