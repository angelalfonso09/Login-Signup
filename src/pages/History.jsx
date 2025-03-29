import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/History.css";
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";
import Turbudity from "../sensors/turbudity";
import Tds from "../sensors/Tds";
import Do from "../sensors/Do";
import Conductivity from "../sensors/Conductivity";
import "../styles/theme.css";
import { ThemeContext } from "../context/ThemeContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const History = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sensorData, setSensorData] = useState([]);

  // Function to receive real-time data from sensors
  const updateSensorData = (sensor, value, unit) => {
    setSensorData((prevData) => [
      ...prevData,
      {
        Sensor: sensor,
        Value: value,
        Unit: unit,
        Time: new Date().toLocaleTimeString(), // Add timestamp
      },
    ]);
  };

  const exportToExcel = () => {
    if (sensorData.length === 0) {
      alert("No data to export!");
      return;
    }
  
    try {
      const wb = XLSX.utils.book_new();
  
      // Group data by sensor type
      const groupedData = sensorData.reduce((acc, entry) => {
        if (!acc[entry.Sensor]) acc[entry.Sensor] = [];
        acc[entry.Sensor].push(entry);
        return acc;
      }, {});
  
      // Create a separate sheet for each sensor
      Object.keys(groupedData).forEach((sensor) => {
        const ws = XLSX.utils.json_to_sheet(groupedData[sensor]);
        XLSX.utils.book_append_sheet(wb, ws, sensor); // Add sheet per sensor
      });
  
      // Create Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
  
      saveAs(blob, "RealTimeSensorData.xlsx");
      console.log("Excel file exported successfully with separate sheets per sensor.");
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };
  
  return (
    <div className={`history ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="history-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="history-contents">
          {/* Pass updateSensorData to sensors */}
          <Temp theme={theme} updateSensorData={updateSensorData} />
          <PhLevel theme={theme} updateSensorData={updateSensorData} />
          <Turbudity theme={theme} updateSensorData={updateSensorData} />
          <Tds theme={theme} updateSensorData={updateSensorData} />
          <Do theme={theme} updateSensorData={updateSensorData} />
          <Conductivity theme={theme} updateSensorData={updateSensorData} />

          <div className="export-buttons">
            <button onClick={exportToExcel} className="export-btn">Export Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
