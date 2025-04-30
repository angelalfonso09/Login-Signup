import React, { useState, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/MetersCss/Temperature.css";
import { ThemeContext } from "../context/ThemeContext";

const Temperature = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(true);
  const temperature = 28;
  const waterQuality = "Great";
  const percentage = (temperature / 100) * 100;

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
            pathColor: isConnected ? "#20a44c" : "#d9534f",
            trailColor: theme === "dark" ? "#333" : "#e5e7eb",
            strokeLinecap: "round",
          })}
        >
          <div className="temperature-text">
            <span className="label">Temperature</span>
            <span className="value">{temperature}</span>
            <span className="unit">°C</span>
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

export default Temperature;