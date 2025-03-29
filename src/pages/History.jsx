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

  const exportToCSV = () => {
    if (sensorData.length === 0) {
      alert("No data to export!");
      return;
    }
    try {
      const csv = Papa.unparse(sensorData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "RealTimeSensorData.csv");
      console.log("CSV file exported successfully.");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const exportToExcel = () => {
    if (sensorData.length === 0) {
      alert("No data to export!");
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(sensorData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RealTimeData");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      saveAs(blob, "RealTimeSensorData.xlsx");
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
        <div className="history-contents">
          {/* Pass updateSensorData to sensors */}
          <Temp theme={theme} updateSensorData={updateSensorData} />
          <PhLevel theme={theme} updateSensorData={updateSensorData} />
          <Turbudity theme={theme} updateSensorData={updateSensorData} />
          <Tds theme={theme} updateSensorData={updateSensorData} />
          <Do theme={theme} updateSensorData={updateSensorData} />
          <Conductivity theme={theme} updateSensorData={updateSensorData} />

          <div className="export-buttons">
            <button onClick={exportToCSV} className="export-btn">Export CSV</button>
            <button onClick={exportToExcel} className="export-btn">Export Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
