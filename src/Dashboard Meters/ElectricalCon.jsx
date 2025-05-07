import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";

const NewSensor = () => {
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
    if (ecValue <= 500) return "Excellent";     // Freshwater typical
    if (ecValue <= 1000) return "Good";         // Acceptable
    if (ecValue <= 2000) return "Fair";         // Elevated salts
    return "Poor";                               // Very high salinity
  };

  const percentage = (ecValue / 3000) * 100; // Assuming max EC = 3000 µS/cm for scale

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
            <span className="label">Electrical Conductivity</span>
            <span className="value">{ecValue}</span>
            <span className="unit">µS/cm</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${
          getWaterQuality() === "Excellent"
            ? "text-blue-600"
            : getWaterQuality() === "Good"
            ? "text-green-500"
            : getWaterQuality() === "Fair"
            ? "text-yellow-400"
            : "text-red-500"
        }`}>
          {getWaterQuality()}
        </span>
      </p>
    </div>
  );
};

export default NewSensor;

