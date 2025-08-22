import React, { useState, useEffect, useContext } from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ThemeContext } from "../context/ThemeContext";
import socket from "./socket";
import { Activity, WifiOff, Wifi } from "lucide-react"; // Import icons

const Temperature = () => {
  const { theme } = useContext(ThemeContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [temperature, setTemperature] = useState(0); // Default initial temperature value
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleTemperatureData = (newData) => {
      console.log("🔄 New Temperature Data:", newData);
      setIsAnimating(true);
      setTemperature(newData.value);
      setTimeout(() => setIsAnimating(false), 800); // Animation duration
    };

    // Fetch latest temperature value on mount (fallback)
    const fetchLatestTemperature = async () => {
      try {
        const response = await fetch("https://login-signup-3470.onrender.com/api/sensors/latest");
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

  const getWaterQuality = () => {
    if (temperature > 25 && temperature < 35) return "Good";
    if (temperature <= 25) return "Cold";
    return "Hot";
  };

  const percentage = (temperature / 50) * 100; // Using 50°C as the maximum for the scale

  // Determine path color based on temperature ranges
  const getPathColor = () => {
    if (!isConnected) return "#d9534f"; // Disconnected color
    if (temperature > 25 && temperature < 35) return "#20a44c"; // Good range (Green)
    if (temperature <= 25) return "#5bc0de"; // Cold (Blue)
    return "#f0ad4e"; // Hot (Orange)
  };
  
  // Determine text color based on water quality
  const getQualityTextColor = () => {
    const quality = getWaterQuality();
    switch(quality) {
      case "Good": return "#20a44c"; // Green
      case "Cold": return "#5bc0de"; // Blue
      case "Hot": return "#f0ad4e"; // Orange
      default: return "#5bc0de"; // Blue
    }
  };

  const meterStyles = {
    container: {
      position: 'relative',
      backgroundColor: theme === 'dark' ? '#1e1f21' : '#ffffff',
      borderRadius: '12px',
      padding: '1.2rem',
      boxShadow: theme === 'dark' 
        ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
        : '0 8px 16px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      transform: isAnimating ? 'scale(1.03)' : 'scale(1)',
      border: theme === 'dark' 
        ? '1px solid #444' 
        : '1px solid #e5e7eb',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: '0.5rem',
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: '500',
      backgroundColor: isConnected 
        ? (theme === 'dark' ? 'rgba(32, 164, 76, 0.2)' : 'rgba(32, 164, 76, 0.1)') 
        : (theme === 'dark' ? 'rgba(217, 83, 79, 0.2)' : 'rgba(217, 83, 79, 0.1)'),
      color: isConnected ? '#20a44c' : '#d9534f',
      transition: 'all 0.3s ease',
      alignSelf: 'flex-start',
    },
    meter: {
      width: '90%',
      maxWidth: '220px',
      margin: '0 auto',
      padding: '10px 0',
    },
    valueText: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    label: {
      fontSize: '0.85rem',
      color: theme === 'dark' ? '#aaa' : '#777',
      marginBottom: '0.2rem',
    },
    value: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: getPathColor(),
      marginBottom: '0.2rem',
      transition: 'color 0.3s ease',
    },
    unit: {
      fontSize: '0.8rem',
      color: theme === 'dark' ? '#aaa' : '#777',
    },
    qualityContainer: {
      marginTop: '1rem',
      textAlign: 'center',
      padding: '8px 0',
      borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #e5e7eb',
    },
    qualityLabel: {
      fontSize: '0.9rem',
      color: theme === 'dark' ? '#ddd' : '#555',
    },
    qualityValue: {
      fontWeight: 'bold',
      color: getQualityTextColor(),
      transition: 'color 0.3s ease',
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '60px',
      height: '24px',
      cursor: 'pointer',
    },
    slider: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isConnected 
        ? (theme === 'dark' ? '#20a44c' : '#1dc958') 
        : (theme === 'dark' ? '#444' : '#ccc'),
      borderRadius: '12px',
      transition: 'background-color 0.3s ease',
    },
    knob: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: isConnected ? '38px' : '4px',
      bottom: '3px',
      backgroundColor: theme === 'dark' ? '#fff' : '#fff',
      borderRadius: '50%',
      transition: 'left 0.3s ease',
    }
  };

  return (
    <div style={meterStyles.container}>
      <div style={meterStyles.header}>
        <div style={meterStyles.title}>
          <Activity size={18} color={getPathColor()} />
          Temperature
        </div>
        <div style={meterStyles.statusIndicator}>
          {isConnected ? (
            <>
              <Wifi size={14} />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div style={meterStyles.meter}>
        <CircularProgressbarWithChildren
          value={percentage}
          styles={buildStyles({
            pathColor: getPathColor(),
            trailColor: theme === "dark" ? "#333" : "#e5e7eb",
            strokeLinecap: "round",
            pathTransition: isAnimating ? "stroke-dashoffset 0.5s ease 0s" : "none",
            // Customize thickness
            strokeWidth: 12,
          })}
        >
          <div style={meterStyles.valueText}>
            <span style={meterStyles.label}>Reading</span>
            <span style={meterStyles.value}>{temperature}</span>
            <span style={meterStyles.unit}>°C</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <div style={meterStyles.qualityContainer}>
        <span style={meterStyles.qualityLabel}>
          Water Quality: {' '}
          <span style={meterStyles.qualityValue}>
            {getWaterQuality()}
          </span>
        </span>
      </div>

      {/* Connection toggle for visual reference only */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <div style={meterStyles.toggle}>
          <div style={meterStyles.slider}>
            <div style={meterStyles.knob}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Temperature;
