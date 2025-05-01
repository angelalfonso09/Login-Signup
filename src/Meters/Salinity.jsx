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
    if (salinity <= 35) return "Excellent";
    if (salinity <= 50) return "Moderate";
    return "Poor";
  };

  const percentage = (salinity / 100) * 100; // Assuming max salinity is 100 PSU

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
            <span className="label">Salinity</span>
            <span className="value">{salinity}</span>
            <span className="unit">PSU</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${
          getWaterQuality() === "Excellent" ? "text-blue-600" :
          getWaterQuality() === "Moderate" ? "text-yellow-400" : "text-red-500"
        }`}>
          {getWaterQuality()}
        </span>
      </p>
    </div>
  );
};

export default Dissolved;
