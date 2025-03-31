import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/do.css";

const DOMonitor = ({ theme, updateSensorData }) => {
  const [doData, setDoData] = useState([]);

  const fetchDO = () => {
    setTimeout(() => {
      const randomDO = (Math.random() * 14).toFixed(2);
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        do: parseFloat(randomDO),
      };

      setDoData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // ✅ Send updated DO data to another component
      if (updateSensorData) {
        updateSensorData("Dissolved Oxygen Level", parseFloat(randomDO), "mg/L");
      }
    }, 1000);
  };

  useEffect(() => {
    fetchDO();
    const interval = setInterval(fetchDO, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Define theme-based colors
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White for dark mode, black for light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#3498db" : "#FF5733";  // Blue in dark mode, red in light mode
  const tooltipBg = theme === "dark" ? "#222222" : "#ffffff";  // Dark tooltip for dark mode

  return (
    <div className={`do-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Dissolved Oxygen (DO) Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={doData}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[0, 14]} 
            tick={{ fill: textColor }} 
            label={{ value: "mg/L", angle: -90, position: "insideLeft", fill: textColor }} 
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
