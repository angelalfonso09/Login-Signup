import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/do.css"

const DOMonitor = ({ theme }) => {
  const [doData, setDoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDO = () => {
    setTimeout(() => {
      const randomDO = (Math.random() * 14).toFixed(2); // Simulated DO value (0-14 mg/L)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        do: parseFloat(randomDO),
      };

      setDoData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchDO();
    const interval = setInterval(fetchDO, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading Dissolved Oxygen data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`do-monitor-container ${theme}`}>
      <h2>Dissolved Oxygen (DO) Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={doData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 14]} label={{ value: "mg/L", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="do" stroke={theme === "dark" ? "#3498db" : "#FF5733"} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DOMonitor;
