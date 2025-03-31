import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./sensorsCSS/turb.css";

const TurbidityMonitor = ({ theme }) => {
  const [turbidityData, setTurbidityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial turbidity data
  const fetchTurbidity = async () => {
    try {
      const response = await fetch("http://localhost:5000/data");
      const data = await response.json();

      // Normalize data to ensure correct format
      const formattedData = data.map(item => ({
        timestamp: item.timestamp,  // Ensure this field exists
        value: parseFloat(item.turbidity_value) || 0, // Convert to number
      }));

      setTurbidityData(formattedData);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch turbidity data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurbidity();
    
    const socket = io("http://localhost:5000");

    // Listen for real-time updates
    socket.on("updateData", (newData) => {
      setTurbidityData(prevData => {
        const updatedData = [...prevData.slice(-19), {
          timestamp: new Date().toLocaleTimeString(), // Use current time
          value: parseFloat(newData.value) || 0,
        }];
        return updatedData;
      });
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <div>Loading turbidity data...</div>;
  if (error) return <div>Error: {error}</div>;

  // ✅ Define colors dynamically based on theme
  const textColor = theme === "dark" ? "#ffffff" : "#333333";  // White for dark mode, black for light mode
  const gridColor = theme === "dark" ? "#555555" : "#cccccc";  // Darker grid lines for better contrast
  const lineColor = theme === "dark" ? "#00c3ff" : "#ff7300";  // Light blue in dark mode, orange in light mode
  const tooltipBg = theme === "dark" ? "#222222" : "#ffffff";  // Dark tooltip for dark mode

  // Calculate min/max values for Y-Axis dynamically
  const minY = 0;
  const maxY = 100; // Set the maximum to 100 instead of 73

  return (
    <div className={`turbidity-monitor-container ${theme}`}>
      <h2 style={{ color: textColor }}>Water Turbidity Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={turbidityData}>
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: textColor, fontWeight: "bold" }} 
            angle={-17} 
            textAnchor="end" 
          />
          <YAxis 
            domain={[minY, maxY]} 
            tick={{ fill: textColor }} 
            label={{ value: "NTU", angle: -90, position: "insideLeft", fill: textColor }} 
          />
          <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: textColor }} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TurbidityMonitor;
