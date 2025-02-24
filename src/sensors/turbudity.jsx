import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const TurbidityMonitor = () => {
  const [turbidityData, setTurbidityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTurbidity = () => {
    setTimeout(() => {
      const randomTurbidity = (Math.random() * 10).toFixed(2); // Simulated NTU value (0-10)
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        turbidity: parseFloat(randomTurbidity),
      };

      setTurbidityData((prevData) => [...prevData.slice(-19), newDataPoint]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTurbidity();
    const interval = setInterval(fetchTurbidity, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading turbidity data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="turbidity-monitor-container">
      <h2>Water Turbidity Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={turbidityData}>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" />
          <YAxis domain={[0, 10]} label={{ value: "NTU", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="turbidity" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TurbidityMonitor;
