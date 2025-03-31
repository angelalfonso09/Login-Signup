import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/theme.css";
import Meter from "../components/Meter";
import ReportsTable from "../components/ReportsTable";
import { ThemeContext } from "../context/ThemeContext"; 
import Ph from "../Meters/Ph";
import Tds from "../Meters/Tds";
import Conductivity from "../Meters/Conductivity";
import Dissolved from "../Meters/Dissolved";
import Temperature from "../Meters/Temperature";
import Turbidity from "../Meters/Turbidity";

const Dashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Access ThemeContext

  return (
    <div className={`db ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="db-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="db-contents">
          <div className="meter-grid">
            <Turbidity/>
            <Temperature />
            <Dissolved />
            <Conductivity />
            <Tds/>
            <Ph/>
          </div>
          <ReportsTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
