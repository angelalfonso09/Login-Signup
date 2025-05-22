import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const Turbidity = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [turbidityValue, setTurbidityValue] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleTurbidityData = (newData) => {
      console.log("🔄 New Turbidity Data:", newData);
      setTurbidityValue(newData.value);

      // Show warning if turbidity is below 40
      if (newData.value < 40) {
        setShowWarning(true);
      } else {
        setShowWarning(false); // Hide warning if turbidity value goes above 40
      }
    };

    // Fetch latest turbidity value on mount (fallback)
    const fetchLatestTurbidity = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        setTurbidityValue(latestData.turbidity_value);
        console.log("📂 Fetched latest turbidity value:", latestData.turbidity_value);

        // Check if the fetched value is below 40 and show warning
        if (latestData.turbidity_value < 40) {
          setShowWarning(true);
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch latest turbidity data:", err.message);
      }
    };

    fetchLatestTurbidity();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateTurbidityData", handleTurbidityData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateTurbidityData", handleTurbidityData);
    };
  }, []);

  const getWaterQuality = () => {
    if (turbidityValue >= 70) return "Good";
    if (turbidityValue >= 40) return "Moderate";
    return "Poor";
  };

  const percentage = (turbidityValue / 100) * 100;

  return (
    <div className={`widget-container ${theme}`}>
      <div className="toggle-wrapper">
        <div className={`custom-toggle ${isConnected ? "connected" : "disconnected"}`}>
          <div className="slider" />
          <div className="toggle-label connected-label">Connected</div>
          <div className="toggle-label disconnected-label">Disconnected</div>
        </div>
      </div>

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

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span
          className={`font-bold ${getWaterQuality() === "Good" ? "text-green-500" : getWaterQuality() === "Moderate" ? "text-yellow-400" : "text-red-500"}`}
        >
          {getWaterQuality()}
        </span>
      </p>

      {/* Pop-up Warning Notification (Centered on Screen) */}
      {showWarning && (
        <div className="warning-popup">
          <div className="popup-content">
            <h3>⚠️ Water Quality Alert!</h3>
            <p>The water turbidity is below 40 NTU, indicating poor water quality. Please take action.</p>
            <button onClick={() => setShowWarning(false)} className="close-popup">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Turbidity;
