import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/theme.css";
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
            <div className="meter-item">
              <div className="meter-label">Turbidity</div>
              <Turbidity/>
            </div>
            <div className="meter-item">
              <div className="meter-label">Temperature</div>
              <Temperature />
            </div>
            <div className="meter-item">
              <div className="meter-label">Dissolved Oxygen</div>
              <Dissolved />
            </div>
            <div className="meter-item">
              <div className="meter-label">Conductivity</div>
              <Conductivity />
            </div>
            <div className="meter-item">
              <div className="meter-label">Total Dissolved Solids (TDS)</div>
              <Tds/>
            </div>
            <div className="meter-item">
              <div className="meter-label">pH Level</div>
              <Ph/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
