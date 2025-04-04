import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import io from 'socket.io-client'; // Import socket.io-client
import "./sensorsCSS/do.css"; // Make sure to adjust this to your CSS for Salinity if needed

const DOMonitor = ({ theme, updateSensorData }) => {
  const [doData, setDoData] = useState([]);

  useEffect(() => {
    // Connect to the backend via Socket.io
    const socket = io("http://localhost:5000"); // Ensure the backend is running

    // Listen for real-time salinity data updates
    socket.on("updateSalinityData", (data) => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        do: parseFloat(data.value), // Use the salinity value from the response
      };

      setDoData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // Send updated salinity data to another component (if needed)
      if (updateSensorData) {
        updateSensorData("Salinity Level", parseFloat(data.value), "ppt");
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [updateSensorData]);

  // Define theme-based colors dynamically
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White for dark mode, black for light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#3498db" : "#FF5733";  // Blue in dark mode, red in light mode
  const tooltipBg = theme === "dark" ? "#222222" : "#ffffff";  // Dark tooltip for dark mode

  return (
    <div className={`do-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Salinity Level (ppt)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={doData}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }}
            angle={-17}
            textAnchor="end"
          />
          <YAxis
            domain={[0.0, 1.0]} // Domain set to 0.0 to 1.0 for salinity values
            tick={{ fill: textColor }}
            label={{ value: "ppt", angle: -90, position: "insideLeft", fill: textColor }}
          />
          <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="do" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DOMonitor;
