import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/MetersCss/Temperature.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const Temperature = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [temperature, setTemperature] = useState(0); // Default initial temperature value

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleTemperatureData = (newData) => {
      console.log("🔄 New Temperature Data:", newData);
      setTemperature(newData.value);
    };

    // Fetch latest temperature value on mount (fallback)
    const fetchLatestTemperature = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        setTemperature(latestData.temperature_value);
        console.log("📂 Fetched latest temperature value:", latestData.temperature_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest temperature data:", err.message);
      }
    };

    fetchLatestTemperature();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateTemperatureData", handleTemperatureData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateTemperatureData", handleTemperatureData);
    };
  }, []);

  const percentage = (temperature / 100) * 100;

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
            <span className="label">Temperature</span>
            <span className="value">{temperature}</span>
            <span className="unit">°C</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality: <span className="text-blue-600 font-bold">Good</span>
      </p>
    </div>
  );
};

export default Temperature;
