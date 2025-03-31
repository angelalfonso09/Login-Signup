import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/temp.css"; 

const WaterTemperature = ({ theme, updateSensorData }) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemperature = () => {
    setTimeout(() => {
      const simulatedTemperature = Math.floor(Math.random() * 100);
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        temperature: simulatedTemperature,
      };

      setTemperatureData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);

      // ✅ Send updated data to History.jsx
      updateSensorData("Temperature", simulatedTemperature, "°C");
    }, 1000);
  };

  useEffect(() => {
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading temperature data...</div>;
  if (error) return <div>Error: {error}</div>;

  // ✅ Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White in dark mode, black in light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for contrast
  const lineColor = theme === "dark" ? "#ffcc00" : "#ff4500";  // Yellow for dark mode, Red for light mode

  return (
    <div className={`water-temperature-container ${theme}`}>
      <h2 style={{ color: textColor }}>Water Temperature</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={temperatureData}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: textColor }} 
            label={{ value: "°C", angle: -90, position: "insideLeft", fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#222222" : "#ffffff", color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="temperature" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterTemperature;
