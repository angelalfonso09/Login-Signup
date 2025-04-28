import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/temp.css";  // 👉 create a CSS file similar to temp.css

const ElectricalConductivity = ({ theme, updateSensorData }) => {
  const [conductivityData, setConductivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConductivity = () => {
    setTimeout(() => {
      const simulatedConductivity = Math.floor(Math.random() * 2000); // Example: conductivity in μS/cm
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        conductivity: simulatedConductivity,
      };

      setConductivityData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);

      // ✅ Send updated data to History.jsx
      updateSensorData("Electrical Conductivity", simulatedConductivity, "μS/cm");
    }, 1000);
  };

  useEffect(() => {
    fetchConductivity();
    const interval = setInterval(fetchConductivity, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading conductivity data...</div>;
  if (error) return <div>Error: {error}</div>;

  // ✅ Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  
  const lineColor = theme === "dark" ? "#00d1ff" : "#0077b6";  

  return (
    <div className={`electrical-conductivity-container ${theme}`}>
      <h2 style={{ color: textColor }}>Electrical Conductivity</h2>
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
            tick={{ fill: textColor }} 
            label={{ value: "μS/cm", angle: -90, position: "insideLeft", fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#222222" : "#ffffff", color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="conductivity" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElectricalConductivity;
