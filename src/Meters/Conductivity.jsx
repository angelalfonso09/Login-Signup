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
        setConductivityValue(latestData.conductivity_value);
        console.log("📂 Fetched latest conductivity value:", latestData.conductivity_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest conductivity data:", err.message);
      }
    };

    fetchLatestConductivity();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updateECData", handleConductivityData); // Make sure your backend emits "updateConductivity"!

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updateECData", handleConductivityData);
    };
  }, []);

  const getWaterQuality = () => {
    if (conductivityValue >= 700) return "Good";
    if (conductivityValue >= 300) return "Moderate";
    return "Poor";
  };

  const percentage = (conductivityValue / 1000) * 100;

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
            <span className="label">Conductivity</span>
            <span className="value">{conductivityValue}</span>
            <span className="unit">µS/cm</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${getWaterQuality() === "Good" ? "text-green-500" : getWaterQuality() === "Moderate" ? "text-yellow-400" : "text-red-500"}`}>
          {getWaterQuality()}
        </span>
      </p>
    </div>
  );
};

export default Conductivity;
