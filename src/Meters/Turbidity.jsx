import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Adjust the port if necessary

const Turbidity = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(false);
  const [turbidityValue, setTurbidityValue] = useState(0);

  useEffect(() => {
    // Check socket connection status
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // Initial data fetch (optional)
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Listen for real-time data
    const handleTurbidityData = (newData) => {
      console.log("🔄 New Turbidity Data:", newData);
      setTurbidityValue(newData.value);
    };

    socket.on("updateData", handleTurbidityData); // Make sure the backend emits this event

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateData", handleTurbidityData);
    };
  }, []);

  // Compute quality
  const getWaterQuality = () => {
    if (turbidityValue >= 70) return "Good";
    if (turbidityValue >= 40) return "Moderate";
    return "Poor";
  };

  const percentage = (turbidityValue / 100) * 100;

  return (
    <div className={`widget-container ${theme}`}>
      {/* Toggle */}
      <div className="toggle-wrapper">
        <div className={`custom-toggle ${isConnected ? "connected" : "disconnected"}`}>
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
            <span className="label">Turbidity</span>
            <span className="value">{turbidityValue}</span>
            <span className="unit">NTU</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      {/* Water Quality */}
      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${getWaterQuality() === "Good" ? "text-green-500" : getWaterQuality() === "Moderate" ? "text-yellow-400" : "text-red-500"}`}>
          {getWaterQuality()}
        </span>
      </p>
    </div>
  );
};

export default Turbidity;
