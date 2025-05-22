import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import io from 'socket.io-client';
import "./sensorsCSS/phlevel.css"; 

const PHLevelMonitor = ({ theme, updateSensorData }) => {
  const [phData, setPhData] = useState([]);

  useEffect(() => {
    // Connect to the backend via Socket.io
    const socket = io("http://localhost:5000");

    // Listen for real-time pH level data updates
    socket.on("updatePHData", (data) => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        ph: parseFloat(data.value),
      };
      setPhData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // Send updated pH level data to History.jsx
      if (updateSensorData) {
        updateSensorData("pH Level", parseFloat(data.value), "");
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
  const lineColor = theme === "dark" ? "#8884d8" : "#ff7300";

  return (
    <div className={`ph-level-container ${theme}`}>
      <h2 style={{ color: textColor }}>Water pH Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={phData}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[0, 14]} 
            tick={{ fill: textColor }} 
            label={{ value: "pH", angle: -90, position: "insideLeft", fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#222222" : "#ffffff", color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="ph" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PHLevelMonitor;
