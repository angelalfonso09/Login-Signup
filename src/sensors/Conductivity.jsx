import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/conduct.css";

const ConductivityMonitor = ({ theme, updateSensorData }) => {
  const [conductivityData, setConductivityData] = useState([]);

  const fetchConductivity = () => {
    setTimeout(() => {
      const randomConductivity = (Math.random() * 2000).toFixed(2); // Simulated Conductivity (0-2000 µS/cm)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        conductivity: parseFloat(randomConductivity),
      };

      setConductivityData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // ✅ Send updated Conductivity data to another component
      if (updateSensorData) {
        updateSensorData("Water Conductivity", parseFloat(randomConductivity), "µS/cm");
      }
    }, 1000);
  };

  useEffect(() => {
    fetchConductivity();
    const interval = setInterval(fetchConductivity, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White in dark mode, black in light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#e67e22" : "#2980b9";  // Orange for dark mode, Blue for light mode

  return (
    <div className={`conductivity-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Water Conductivity</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={conductivityData}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[0, 2000]} 
            label={{ value: "µS/cm", angle: -90, position: "insideLeft", fill: textColor }} 
            tick={{ fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#222222" : "#ffffff", color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="conductivity" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConductivityMonitor;
