import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const Conductivity = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [conductivityValue, setConductivityValue] = useState(0);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConductivityData = (newData) => {
      console.log("🔄 New Conductivity Data:", newData);
      setConductivityValue(newData.value);
    };

    // Fetch latest conductivity value on mount (fallback)
    const fetchLatestConductivity = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        // Assuming your backend sends 'conductivity_value' for conductivity
        setConductivityValue(latestData.conductivity_value); 
        console.log("📂 Fetched latest conductivity value:", latestData.conductivity_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest conductivity data:", err.message);
      }
    };

    fetchLatestConductivity();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateECData", handleConductivityData); // Make sure your backend emits "updateECData"!

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateECData", handleConductivityData);
    };
  }, []);

  const getWaterQuality = () => {
    if (conductivityValue >= 70 && conductivityValue <= 100) return "Safe";
    if (conductivityValue >= 40 && conductivityValue < 70) return "Moderate";
    if (conductivityValue > 0 && conductivityValue < 40) return "Not Safe";
    if (conductivityValue === 0) return "Critical";
    return "Unknown"; // Fallback for values outside defined ranges
  };

  // Calculate percentage out of 100
  // This ensures the progress bar visually represents the 0-100 scale.
  const percentage = Math.min(Math.max(conductivityValue, 0), 100); 

  // Determine path color based on safety ranges
  const getPathColor = () => {
    if (!isConnected) return "#d9534f"; // Disconnected color
    if (conductivityValue >= 70 && conductivityValue <= 100) return "#20a44c"; // Safe (Green)
    if (conductivityValue >= 40 && conductivityValue < 70) return "#f0ad4e"; // Moderate (Orange)
    if (conductivityValue > 0 && conductivityValue < 40) return "#d9534f"; // Not Safe (Red)
    if (conductivityValue === 0) return "#777"; // Critical (Darker color)
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
            <span className="label">Conductivity</span>
            <span className="value">{conductivityValue}</span>
            <span className="unit">Safety Score</span>
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

export default Conductivity;