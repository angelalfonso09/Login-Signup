import React, { useState, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// You might need to create this CSS file or adjust the existing one
// import "../styles/MetersCss/Ph.css";
import { ThemeContext } from "../context/ThemeContext";

const Ph = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(true);
  const phValue = 7.2; // Example pH value
  const waterQuality = "Neutral"; // Example water quality
  const percentage = ((phValue - 0) / 14) * 100; // Assuming pH scale is 0-14

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
          <div className="temperature-text"> {/* Reusing the style, adjust if needed */}
            <span className="label">pH</span>
            <span className="value">{phValue}</span>
            {/* pH doesn't typically have a unit */}
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

export default Ph;