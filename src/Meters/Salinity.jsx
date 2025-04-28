import React, { useState, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// You might need to create this CSS file or adjust the existing one
// import "../styles/MetersCss/Dissolved.css";
import { ThemeContext } from "../context/ThemeContext";

const Dissolved = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(true);
  const dissolvedOxygen = 8.5; // Example dissolved oxygen value
  const waterQuality = "Excellent"; // Example water quality
  const percentage = (dissolvedOxygen / 15) * 100; // Example: Assuming max DO is 15 ppm

  return (
    <div className={`widget-container ${theme}`}>
      {/* Toggle */}
      <div className="toggle-wrapper">
        <div
          className={`custom-toggle ${isConnected ? "connected" : "disconnected"}`}
          onClick={() => setIsConnected(!isConnected)}
        >
          <div className="slider" />
          <div className="toggle-label connected-label">Connected</div>
          <div className="toggle-label disconnected-label">Disconnected</div>
        </div>
      </div>

      {/* Meter */}
      <div className="meter-container">
        <CircularProgressbarWithChildren
          value={percentage}
          styles={buildStyles({
            pathColor: isConnected ? "#2563eb" : "#d9534f",
            trailColor: theme === "dark" ? "#333" : "#e5e7eb",
            strokeLinecap: "round",
          })}
        >
          <div className="temperature-text"> {/* Reusing the style, adjust if needed */}
            <span className="label">Dissolved O₂</span>
            <span className="value">{dissolvedOxygen}</span>
            <span className="unit">ppm</span> {/* Assuming ppm is the unit */}
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* Water Quality */}
      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality: <span className="text-blue-600 font-bold">{waterQuality}</span>
      </p>
    </div>
  );
};

export default Dissolved;