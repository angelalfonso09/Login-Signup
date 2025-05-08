import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Pages Css/Dashboard.module.css";
import { ThemeContext } from "../context/ThemeContext";
import DashboardPage from "../components/DashboardPage";
import EstablishmentSensors from "../components/DashboardEstablishment";


const Dashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`${styles.db} ${theme}`}>

      <div className={styles.dbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.dbContents}>
          <div className={styles.meterRowFlex}>

            <DashboardPage/>
            <div className={styles.establishmentContainer}>
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

export default Dashboard;
