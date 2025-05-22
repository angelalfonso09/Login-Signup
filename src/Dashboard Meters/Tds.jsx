import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const Tds = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [tdsValue, setTdsValue] = useState(0);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleTdsData = (newData) => {
      console.log("🔄 New TDS Data:", newData);
      setTdsValue(newData.value);
    };

    // Fetch latest TDS value on mount (fallback)
    const fetchLatestTds = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        setTdsValue(latestData.tds_value);
        console.log("📂 Fetched latest TDS value:", latestData.tds_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest TDS data:", err.message);
      }
    };

    fetchLatestTds();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateTDSData", handleTdsData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateTDSData", handleTdsData);
    };
  }, []);

  const getWaterQuality = () => {
    if (tdsValue >= 70 && tdsValue <= 100) return "Safe";
    if (tdsValue >= 40 && tdsValue < 70) return "Moderate";
    if (tdsValue > 0 && tdsValue < 40) return "Not Safe";
    if (tdsValue === 0) return "Critical";
    return "Unknown"; // Fallback for values outside defined ranges
  };

  // Calculate percentage out of 100
  // This assumes a maximum relevant TDS value of 100 for the visual representation.
  const percentage = Math.min(Math.max(tdsValue, 0), 100); 

  // Determine path color based on safety ranges
  const getPathColor = () => {
    if (!isConnected) return "#d9534f"; // Disconnected color
    if (tdsValue >= 70 && tdsValue <= 100) return "#20a44c"; // Safe (Green)
    if (tdsValue >= 40 && tdsValue < 70) return "#f0ad4e"; // Moderate (Orange)
    if (tdsValue > 0 && tdsValue < 40) return "#d9534f"; // Not Safe (Red)
    if (tdsValue === 0) return "#777"; // Critical (Darker color for critical)
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
            pathColor: getPathColor(), // Dynamic path color
            trailColor: theme === "dark" ? "#333" : "#e5e7eb",
            strokeLinecap: "round",
          })}
        >
          <div className="temperature-text">
            <span className="label">TDS</span>
            <span className="value">{tdsValue}</span>
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

export default Tds;