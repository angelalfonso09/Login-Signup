import React from "react";
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "../styles/MetersCss/Ph.css";

const Ph = () => {
  const temperature = 28;
  const waterQuality = "Great";
  const percentage = (temperature / 100) * 100; // Assuming max temp is 100

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-2xl shadow-lg w-60">
      <div className="relative w-32 h-32">
        <CircularProgressbarWithChildren
          value={percentage}
          styles={buildStyles({
            pathColor: "#2563eb",
            trailColor: "#e5e7eb",
            strokeLinecap: "round",
          })}
        >
          <div className="flex flex-col items-center text-blue-600 font-bold">
            <span className="text-sm">100</span>
            <span className="text-2xl">{temperature}</span>
            <span className="text-sm">°C</span>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <p className="mt-4 text-gray-500 text-sm">
        Water quality: <span className="text-blue-600 font-semibold">{waterQuality}</span>
      </p>
    </div>
  );
};

export default Ph;
