import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/tds.css";

const TDSMonitor = ({ theme, updateSensorData }) => {
  const [tdsData, setTdsData] = useState([]);

  const fetchTDS = () => {
    setTimeout(() => {
      const randomTDS = (Math.random() * 1000).toFixed(2); // Simulated TDS value (0-1000 ppm)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        tds: parseFloat(randomTDS),
      };

      setTdsData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // ✅ Send updated TDS data to History.jsx
      if (updateSensorData) {
        updateSensorData("TDS Level", parseFloat(randomTDS), "ppm");
      }
    }, 1000);
  };

  useEffect(() => {
    fetchTDS();
    const interval = setInterval(fetchTDS, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White for dark mode, black for light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#FF5733" : "#3388FF";  // Red in dark mode, blue in light mode
  const tooltipBg = theme === "dark" ? "#222222" : "#ffffff";  // Dark tooltip for dark mode

  return (
    <div className={`tds-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Total Dissolved Solids (TDS) Level</h2>
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
          <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="tds" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TDSMonitor;
