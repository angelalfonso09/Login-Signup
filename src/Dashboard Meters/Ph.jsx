import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import InfoButton from "../components/InfoButton";
import WaterQualityInfoModal from "../components/WaterQualityInfoModal";
import socket from "./socket";

const Ph = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [phValue, setPhValue] = useState(0); // Default neutral pH
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handlePhData = (newData) => {
      console.log("🔄 New pH Data:", newData);
      setPhValue(newData.value);
    };

    // Fetch latest pH value on mount (fallback)
    const fetchLatestPh = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/sensors/latest");
        if (!response.ok) throw new Error("No data found");
        const latestData = await response.json();
        setPhValue(latestData.ph_value);
        console.log("📂 Fetched latest pH value:", latestData.ph_value);
      } catch (err) {
        console.warn("⚠️ Could not fetch latest pH data:", err.message);
      }
    };

    fetchLatestPh();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("updatePHData", handlePhData);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("updatePHData", handlePhData);
    };
  }, []);

  const getWaterQuality = () => {
    if (phValue >= 6.5 && phValue <= 8.5) return "Neutral";
    if (phValue < 6.5) return "Acidic";
    return "Alkaline";
  };

  const percentage = (phValue / 14) * 100; // pH scale is 0-14

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
            <span className="label">pH</span>
            <span className="value">{phValue.toFixed(2)}</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className={`water-quality-text ${theme === "dark" ? "text-white" : "text-gray-600"}`}>
        Water Quality:{" "}
        <span className={`font-bold ${getWaterQuality() === "Neutral" ? "text-blue-600" : getWaterQuality() === "Acidic" ? "text-red-500" : "text-green-500"}`}>
          {getWaterQuality()}
        </span>
      </p>
      
      <div className="info-button-container">
        <InfoButton 
          onClick={() => setShowInfoModal(true)} 
          text="Learn more" 
          icon="info-circle"
        />
      </div>
      
      {/* Water Quality Info Modal with pH parameter active */}
      <WaterQualityInfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)}
        activeParameter="ph"
      />
    </div>
  );
};

export default Ph;
