import React, { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const GaugeMeter = () => {
  const [value, setValue] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // Apply stored theme
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Fetch initial value
    axios.get("http://localhost:5000/data").then((response) => {
      setValue(response.data.value);
    });

    // Listen for real-time updates
    socket.on("updateData", (newData) => {
      setValue(newData.value);
    });

    return () => socket.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const data = [{ name: "Progress", value, fill: "var(--chart-fill)" }];

  return (
    <div className="flex flex-col items-center">
      <div className="gauge-meter-container">
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
        <p className="gauge-meter-value">{value}%</p>
      </div>
    </div>
  );
};

export default GaugeMeter;
