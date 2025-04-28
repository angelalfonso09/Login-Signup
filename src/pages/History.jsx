import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/History.css";
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";
import Turbudity from "../sensors/turbudity";
import Tds from "../sensors/Tds";
import Sal from "../sensors/sal";
import Conductivity from "../sensors/Conductivity";
import "../styles/theme.css";
import { ThemeContext } from "../context/ThemeContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ElectricalConductivity from "../sensors/ElectricalConductivity"; 

const History = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sensorData, setSensorData] = useState([]);
  const [filter, setFilter] = useState("24h"); // Default filter to 24 hours

  // Function to receive real-time data from sensors
  const updateSensorData = (sensor, value, unit) => {
    setSensorData((prevData) => [
      ...prevData,
      {
        Sensor: sensor,
        Value: value,
        Unit: unit,
        Time: new Date().toISOString(), // Use ISO format for easier filtering
      },
    ]);
  };

  // Function to filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    let filterTime;

    switch (filter) {
      case "24h":
        filterTime = now.setHours(now.getHours() - 24);
        break;
      case "7d":
        filterTime = now.setDate(now.getDate() - 7);
        break;
      case "30d":
        filterTime = now.setDate(now.getDate() - 30);
        break;
      default:
        filterTime = now.setHours(now.getHours() - 24);
    }

    return sensorData.filter((entry) => new Date(entry.Time) >= filterTime);
  };

  const exportToExcel = () => {
    const filteredData = getFilteredData(); // Export only filtered data

    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const groupedData = filteredData.reduce((acc, entry) => {
        if (!acc[entry.Sensor]) acc[entry.Sensor] = [];
        acc[entry.Sensor].push(entry);
        return acc;
      }, {});

      Object.keys(groupedData).forEach((sensor) => {
        const ws = XLSX.utils.json_to_sheet(groupedData[sensor]);
        XLSX.utils.book_append_sheet(wb, ws, sensor);
      });

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(blob, `SensorData_${filter}.xlsx`);
      console.log("Excel file exported successfully.");
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  
  return (
    <div className={`history ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="history-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
  
        {/* New Container for Grids and Buttons */}
        <div className="history-content-wrapper">
          <div className="history-contents">
            {/* Filter Buttons */}
{/* Filter Buttons */}
<div className="filter-buttons">
  <button onClick={() => setFilter("24h")} className={filter === "24h" ? "active" : ""}>
    Last 24 Hours
  </button>
  <button onClick={() => setFilter("7d")} className={filter === "7d" ? "active" : ""}>
    Last 7 Days
  </button>
  <button onClick={() => setFilter("30d")} className={filter === "30d" ? "active" : ""}>
    Last 30 Days
  </button>
</div>

  
            {/* Sensor Components */}
            <Temp theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <PhLevel theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <Turbudity theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <Tds theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <Sal theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <Conductivity theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            <ElectricalConductivity theme={theme} updateSensorData={updateSensorData} filteredData={getFilteredData()} />
            {/* Export Button */}
            <div className="export-buttons">
              <button onClick={exportToExcel} className="export-btn">Export Excel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default History;
