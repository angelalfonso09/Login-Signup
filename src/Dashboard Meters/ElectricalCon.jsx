import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const ElectricalCon = () => { // Renamed from NewSensor to ElectricalCon
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [ecValue, setEcValue] = useState(0); // Electrical Conductivity value

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleECData = (newData) => {
      console.log("🔄 New Electrical Conductivity Data:", newData);
      setEcValue(newData.value);
    };

    // Fetch latest EC value on mount (fallback)
    const fetchLatestEC = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        // Assuming your backend sends 'electrical_conductivity'
        setEcValue(latestData.electrical_conductivity);
        console.log("📂 Fetched latest EC value:", latestData.electrical_conductivity);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest EC data:", err.message);
      }
    };

    fetchLatestEC();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateECCompensatedData", handleECData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateECCompensatedData", handleECData);
    };
  }, []);

  const getWaterQuality = () => {
    if (ecValue >= 70 && ecValue <= 100) return "Safe";
    if (ecValue >= 40 && ecValue < 70) return "Moderate";
    if (ecValue > 0 && ecValue < 40) return "Not Safe";
    if (ecValue === 0) return "Critical";
    return "Unknown"; // Fallback for values outside defined ranges
  };

  // Calculate percentage out of 100
  // This ensures the progress bar visually represents the 0-100 scale.
  const percentage = Math.min(Math.max(ecValue, 0), 100);

  // Determine path color based on safety ranges
  const getPathColor = () => {
    if (!isConnected) return "#d9534f"; // Disconnected color
    if (ecValue >= 70 && ecValue <= 100) return "#20a44c"; // Safe (Green)
    if (ecValue >= 40 && ecValue < 70) return "#f0ad4e"; // Moderate (Orange)
    if (ecValue > 0 && ecValue < 40) return "#d9534f"; // Not Safe (Red)
    if (ecValue === 0) return "#777"; // Critical (Darker color)
    return "#5bc0de"; // Default or unknown color (Light Blue)
  };

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
            pathColor: getPathColor(), // Dynamic path color based on quality
            trailColor: theme === "dark" ? "#333" : "#e5e7eb",
            strokeLinecap: "round",
          })}
        >
          <div className="temperature-text">
            <span className="label">Electrical Conductivity</span>
            <span className="value">{ecValue}</span>
            <span className="unit">Safety Score</span> {/* Changed unit to reflect the 0-100 score */}
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${
            getWaterQuality() === "Safe" ? "text-green-500" :
            getWaterQuality() === "Moderate" ? "text-yellow-400" :
            getWaterQuality() === "Not Safe" ? "text-red-500" :
            "text-gray-500" // For critical or unknown
        }`}>
          {getWaterQuality()}
        </span>
      </p>
    </div>
  );
};

export default ElectricalCon; // Export as ElectricalCon
