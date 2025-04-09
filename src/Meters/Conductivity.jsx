import React, { useState, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// You might need to create this CSS file or adjust the existing one
// import "../styles/MetersCss/Conductivity.css";
import { ThemeContext } from "../context/ThemeContext";

const Conductivity = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(true);
  const conductivityValue = 350; // Example conductivity value
  const waterQuality = "Moderate"; // Example water quality
  const percentage = (conductivityValue / 1000) * 100; // Example: Assuming max conductivity is 1000 µS/cm

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
            <span className="label">Conductivity</span>
            <span className="value">{conductivityValue}</span>
            <span className="unit">µS/cm</span> {/* Assuming microSiemens per centimeter */}
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

export default Conductivity;