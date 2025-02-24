import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/temp.css"; 

const WaterTemperature = ({ theme }) => {
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
    }, 1000);
  };

  useEffect(() => {
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading temperature data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`water-temperature-container ${theme}`}>
      <h2>Water Temperature</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={temperatureData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="temperature" stroke={theme === "dark" ? "#8884d8" : "#ff7300"} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterTemperature;
