import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import io from 'socket.io-client'; // Import socket.io-client
// You may not need this import if all styling is in History.css
// import "./sensorsCSS/do.css"; 

const DOMonitor = ({ theme, updateSensorData }) => {
  const [salinityDataPoints, setSalinityDataPoints] = useState([]); // Renamed 'doData' for clarity and accuracy

  useEffect(() => {
    // Connect to the backend via Socket.io
    const socket = io("http://localhost:5000"); // Ensure the backend is running

    // Listen for real-time salinity data updates
    socket.on("updateSalinityData", (data) => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        value: parseFloat(data.value), // Renamed 'do' to 'value' for generic use, matches data.value
      };

      setSalinityDataPoints((prevData) => [...prevData.slice(-19), newDataPoint]);

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
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White for dark mode, black for light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#3498db" : "#FF5733";  // Blue in dark mode, orange/red in light mode
  const tooltipBg = theme === "dark" ? "#222222" : "#ffffff";  // Dark tooltip for dark mode
  const tooltipBorder = theme === "dark" ? "#444444" : "#cccccc"; // Tooltip border
  const tooltipTextColor = theme === "dark" ? "#ffffff" : "#333333"; // Tooltip text color

  return (
    <div className={`aqua-salinity-container ${theme}`}> {/* Changed class to aqua-salinity-container */}
      <h2 style={{ color: textColor }}>Salinity Level (ppt)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salinityDataPoints}> {/* Use salinityDataPoints */}
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
          <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
              itemStyle={{ color: tooltipTextColor }}
              labelStyle={{ color: tooltipTextColor }}
            />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} /> {/* Use dataKey="value" */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DOMonitor;