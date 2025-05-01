import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Userdb.module.css"; // Import the CSS Module
import { ThemeContext } from "../context/ThemeContext";
import Ph from "../Meters/Ph";
import Tds from "../Meters/Tds";
import Conductivity from "../Meters/Conductivity";
import Salinity from "../Meters/Salinity";
import Temperature from "../Meters/Temperature";
import Turbidity from "../Meters/Turbidity";
import ElectricalCon from "../Meters/ElectricalCon"; 

const AdminDB = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`${styles.db} ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className={styles.dbContainer}>
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className={styles.dbContents}>
          <div className={styles.meterRowFlex}>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Turbidity</div>
              <Turbidity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Temperature</div>
              <Temperature />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Salinity</div>
              <Salinity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Conductivity</div>
              <Conductivity />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Total Dissolved Solids (TDS)</div>
              <Tds />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>pH Level</div>
              <Ph />
            </div>
            <div className={styles.meterWidget}>
              <div className={styles.meterLabel}>Electrical Conductivity(Compensated)</div>
              <ElectricalCon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDB;