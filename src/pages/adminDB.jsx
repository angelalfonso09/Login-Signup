import React, { useContext } from "react";
import Navbar from "../components/Navbar"; // Keep if you plan to re-enable
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/adminDB.module.css";
import { ThemeContext } from "../context/ThemeContext";
import AdminDashboardPage from "../components/AdminDashboardPage"; // This seems to be your "Total Sensors" and "Total Users" display
import EstablishmentSensors from "../components/DashboardEstablishment"; // This seems to be your individual "Total Sensors: 9" cards
import Calendar from "../components/CalendarComponent"; // Your Calendar component

const AdminDb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

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
              <EstablishmentSensors />
              <EstablishmentSensors />
              <EstablishmentSensors />
              {/* Add more EstablishmentSensors if you need a specific number, or make this dynamic */}
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