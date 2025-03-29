import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/phlevel.css"; 

const PHLevelMonitor = ({ theme, updateSensorData }) => {
  const [phData, setPhData] = useState([]);

  const fetchPhLevel = () => {
    setTimeout(() => {
      const randomPh = (Math.random() * 14).toFixed(2);
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        ph: parseFloat(randomPh),
      };

      setPhData((prevData) => [...prevData.slice(-19), newDataPoint]);

      // ✅ Send updated pH level data to History.jsx
      if (updateSensorData) {
        updateSensorData("pH Level", parseFloat(randomPh), "");
      }
    }, 1000);
  };

  useEffect(() => {
    fetchPhLevel();
    const interval = setInterval(fetchPhLevel, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`ph-level-container ${theme}`}>
      <h2>Water pH Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={phData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 14]} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="ph" stroke={theme === "dark" ? "#8884d8" : "#ff7300"} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PHLevelMonitor;
