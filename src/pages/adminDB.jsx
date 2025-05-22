import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/adminDB.module.css"; // Import the CSS Module
import { ThemeContext } from "../context/ThemeContext";
import AdminDashboardPage from "../components/AdminDashboardPage";
import EstablishmentSensors from "../components/DashboardEstablishment";


const AdminDb = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`${styles.admindb} ${theme}`}>
      {/* <Navbar theme={theme} toggleTheme={toggleTheme} /> */}
      <div className={styles.admindbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.admindbContents}>
          <div className={styles.meterRowFlex}>

            <AdminDashboardPage/>
            <div className={styles.adminEstablishmentContainer}>
              <EstablishmentSensors />
              <EstablishmentSensors />
              <EstablishmentSensors />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDb;