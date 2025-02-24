import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/tds.css"

const TDSMonitor = ({ theme }) => {
  const [tdsData, setTdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTDS = () => {
    setTimeout(() => {
      const randomTDS = (Math.random() * 1000).toFixed(2); // Simulated TDS value (0-1000 ppm)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        tds: parseFloat(randomTDS),
      };

      setTdsData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTDS();
    const interval = setInterval(fetchTDS, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading TDS data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`tds-monitor-container ${theme}`}>
      <h2>Total Dissolved Solids (TDS) Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={tdsData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 1000]} label={{ value: "ppm", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="tds" stroke={theme === "dark" ? "#FF5733" : "#3388FF"} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TDSMonitor;
