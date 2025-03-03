import React, { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import axios from "axios";
import { io } from "socket.io-client";

// ✅ Connect to WebSocket
const socket = io("http://localhost:3001");

const GaugeMeter = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // ✅ Fetch initial data from the backend
    axios.get("http://localhost:3000/data").then((response) => {
      if (response.data.length > 0) {
        console.log("📡 Initial Data:", response.data[0].turbidity_value);
        setValue(response.data[0].turbidity_value);
      }
    });

    // ✅ Listen for real-time updates
    const handleNewData = (newData) => {
      console.log("🔄 New Data Received:", newData);
      setValue(newData.value);
    };

    socket.on("updateData", handleNewData);

    // ✅ Cleanup function to prevent duplicate listeners
    return () => socket.off("updateData", handleNewData);
  }, []);

  // ✅ Determine water quality status
  const getWaterQuality = () => {
    if (value >= 70) return { text: "Clean Water", color: "text-green-400" };
    if (value >= 40) return { text: "Moderate", color: "text-yellow-400" };
    return { text: "Contaminated", color: "text-red-500" };
  };

  const { text, color } = getWaterQuality();
  const data = [{ name: "Turbidity", value, fill: "#6FCF97" }];

  return (
    <div className="flex flex-col items-center bg-[#131b42] p-6 rounded-xl w-64">
      <RadialBarChart
        width={200}
        height={120}
        cx={100}
        cy={100}
        innerRadius={60}
        outerRadius={100}
        startAngle={180}
        endAngle={0}
        data={data}
      >
        <RadialBar minAngle={15} background dataKey="value" cornerRadius={5} />
      </RadialBarChart>
      <p className="text-white text-3xl font-bold mt-[-20px]">{value}%</p>
      <p className={`text-xl font-semibold mt-2 ${color}`}>{text}</p>
    </div>
  );
};

export default GaugeMeter;
