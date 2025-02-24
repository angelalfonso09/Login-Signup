import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/conduct.css"

const ConductivityMonitor = ({ theme }) => {
  const [conductivityData, setConductivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConductivity = () => {
    setTimeout(() => {
      const randomConductivity = (Math.random() * 2000).toFixed(2); // Simulated Conductivity (0-2000 µS/cm)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        conductivity: parseFloat(randomConductivity),
      };

      setConductivityData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchConductivity();
    const interval = setInterval(fetchConductivity, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading Conductivity data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`conductivity-monitor-container ${theme}`}>
      <h2>Water Conductivity</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={conductivityData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 2000]} label={{ value: "µS/cm", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="conductivity" stroke={theme === "dark" ? "#e67e22" : "#2980b9"} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConductivityMonitor;
