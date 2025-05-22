import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import io from 'socket.io-client'; // Import socket.io-client
import "./sensorsCSS/tds.css";

const TDSMonitor = ({ theme, updateSensorData }) => {
  const [tdsData, setTdsData] = useState([]);

  useEffect(() => {
    // Connect to the backend via Socket.io
    const socket = io("http://localhost:5000"); // Make sure the backend is running

    // Listen for real-time TDS level data updates
    socket.on("updateTDSData", (data) => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        tds: parseFloat(data.value),
      };

      setTdsData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // Send updated TDS level data to History.jsx
      if (updateSensorData) {
        updateSensorData("TDS Level", parseFloat(data.value), "ppm");
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [updateSensorData]);

  // Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";
  const lineColor = theme === "dark" ? "#FF5733" : "#3388FF"; // Red in dark mode, blue in light mode

  return (
    <div className={`tds-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Total Dissolved Solids (TDS)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={tdsData}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[0, 1000]} 
            tick={{ fill: textColor }} 
            label={{ value: "ppm", angle: -90, position: "insideLeft", fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#222222" : "#ffffff", color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="tds" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TDSMonitor;
