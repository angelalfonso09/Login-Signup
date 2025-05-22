import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const Dissolved = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [salinity, setSalinity] = useState(0);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleSalinityData = (newData) => {
      console.log("🔄 New Salinity Data:", newData);
      setSalinity(newData.value);
    };

    // Fetch latest salinity value on mount (fallback)
    const fetchLatestSalinity = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        // Assuming your backend sends 'salinity_value' for dissolved content
        setSalinity(latestData.salinity_value); 
        console.log("📂 Fetched latest salinity value:", latestData.salinity_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest salinity data:", err.message);
      }
    };

    fetchLatestSalinity();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateSalinityData", handleSalinityData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateSalinityData", handleSalinityData);
    };
  }, []);

  const getWaterQuality = () => {
    if (salinity >= 70 && salinity <= 100) return "Safe";
    if (salinity >= 40 && salinity < 70) return "Moderate";
    if (salinity > 0 && salinity < 40) return "Not Safe";
    if (salinity === 0) return "Critical";
    return "Unknown"; // Fallback for values outside defined ranges
  };

  // Calculate percentage out of 100
  // This ensures the progress bar visually represents the 0-100 scale.
  const percentage = Math.min(Math.max(salinity, 0), 100); 

  // Determine path color based on safety ranges
  const getPathColor = () => {
    if (!isConnected) return "#d9534f"; // Disconnected color
    if (salinity >= 70 && salinity <= 100) return "#20a44c"; // Safe (Green)
    if (salinity >= 40 && salinity < 70) return "#f0ad4e"; // Moderate (Orange)
    if (salinity > 0 && salinity < 40) return "#d9534f"; // Not Safe (Red)
    if (salinity === 0) return "#777"; // Critical (Darker color)
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
            <span className="label">Salinity</span>
            <span className="value">{salinity}</span>
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

export default Dissolved;