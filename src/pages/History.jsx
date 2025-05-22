import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar"; // Assuming you have this
import Sidebar from "../components/Sidebar";
import "../styles/Pages Css/History.css";
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";
import Turbidity from "../sensors/turbudity";
import Tds from "../sensors/Tds";
import Sal from "../sensors/sal";
import Conductivity from "../sensors/Conductivity";
import ElectricalConductivity from "../sensors/ElectricalConductivity";
import "../styles/theme.css";
import { ThemeContext } from "../context/ThemeContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const History = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [filter, setFilter] = useState("24h"); // Default filter for the charts
  const [exporting, setExporting] = useState(false); // New state for loading indicator

  // Define your sensors and their corresponding API paths/value columns
  const sensorDefinitions = [
    { name: "Turbidity", tableName: "turbidity_readings", valueColumn: "turbidity_value", apiPath: "/turbidity" },
    { name: "pH Level", tableName: "phlevel_readings", valueColumn: "ph_value", apiPath: "/phlevel" },
    { name: "TDS", tableName: "tds_readings", valueColumn: "tds_value", apiPath: "/tds" },
    { name: "Salinity", tableName: "salinity_readings", valueColumn: "salinity_value", apiPath: "/salinity" },
    { name: "Conductivity", tableName: "ec_readings", valueColumn: "ec_value_mS", apiPath: "/ec" },
    { name: "Electrical Conductivity", tableName: "ec_compensated_readings", valueColumn: "ec_compensated_mS", apiPath: "/ec-compensated" },
    { name: "Temperature", tableName: "temperature_readings", valueColumn: "temperature_celsius", apiPath: "/temperature" },
  ];

  const exportToExcel = async () => {
    setExporting(true); // Set exporting state to true
    let dataToExport = {};

    try {
      // Map filter to backend endpoint segment
      const filterToEndpoint = {
        "realtime": "realtime",
        "24h": "24h",
        "7d": "7d-avg", // Backend uses '7d-avg'
        "30d": "30d-avg", // Backend uses '30d-avg'
      };

      const backendFilter = filterToEndpoint[filter];
      if (!backendFilter) {
        alert("Invalid filter selected for export.");
        setExporting(false);
        return;
      }

      // Fetch data for each sensor
      for (const sensor of sensorDefinitions) {
        const endpoint = `http://localhost:5000/data${sensor.apiPath}/${backendFilter}`;
        console.log(`Workspaceing data for ${sensor.name} from: ${endpoint}`);
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${sensor.name} data: ${response.statusText}`);
        }
        const data = await response.json();

        // Format data for Excel: "Timestamp", "Value", "Unit"
        // You'll need to define units for each sensor if you want them in the Excel
        const formattedSensorData = data.map(item => ({
          Timestamp: new Date(item.timestamp).toLocaleString(),
          Value: parseFloat(item.value),
          Unit: getSensorUnit(sensor.name) // Helper function to get units
        }));
        dataToExport[sensor.name] = formattedSensorData;
      }

      // Check if any data was fetched
      const hasData = Object.values(dataToExport).some(arr => arr.length > 0);
      if (!hasData) {
        alert("No data available for export based on the selected filter.");
        setExporting(false);
        return;
      }

      const wb = XLSX.utils.book_new();

      Object.keys(dataToExport).forEach((sensorName) => {
        if (dataToExport[sensorName].length > 0) {
          const ws = XLSX.utils.json_to_sheet(dataToExport[sensorName]);
          XLSX.utils.book_append_sheet(wb, ws, sensorName); // Sheet name will be sensor name
        }
      });

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(blob, `SensorData_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      console.log("Excel file exported successfully.");

    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert(`Error exporting data: ${error.message}`);
    } finally {
      setExporting(false); // Reset exporting state
    }
  };

  // Helper function to get sensor units (you can expand this)
  const getSensorUnit = (sensorName) => {
    switch (sensorName) {
      case "Turbidity": return "NTU";
      case "pH Level": return "pH";
      case "TDS": return "ppm";
      case "Salinity": return "ppt";
      case "Conductivity": return "mS/cm";
      case "Electrical Conductivity": return "mS/cm";
      case "Temperature": return "°C";
      default: return "";
    }
  };


  return (
    <div className={`history ${theme}`}>
      {/* <Navbar theme={theme} toggleTheme={toggleTheme} /> */}
      <div className="history-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />

        <div className="history-content-wrapper">
          <h1 className={`history-title ${theme}-text`}>Sensor History </h1>
          <div className="history-contents">

            <div className="filter-buttons">
              <button onClick={() => setFilter("realtime")} className={filter === "realtime" ? "active" : ""}>
                Real-time
              </button>
              <button onClick={() => setFilter("24h")} className={filter === "24h" ? "active" : ""}>
                Last 24 Hours
              </button>
              <button onClick={() => setFilter("7d")} className={filter === "7d" ? "active" : ""}>
                Last 7 Days (Avg)
              </button>
              <button onClick={() => setFilter("30d")} className={filter === "30d" ? "active" : ""}>
                Last 30 Days (Avg)
              </button>
            </div>

            {/* Pass the filter prop to each sensor component */}
            {/* The individual sensor components will now fetch their own data for display */}
            <Temp theme={theme} filter={filter} />
            <PhLevel theme={theme} filter={filter} />
            <Turbidity theme={theme} filter={filter} />
            <Tds theme={theme} filter={filter} />
            <Sal theme={theme} filter={filter} />
            <Conductivity theme={theme} filter={filter} />
            <ElectricalConductivity theme={theme} filter={filter} />

            <div className="export-buttons">
              <button onClick={exportToExcel} className="export-btn" disabled={exporting}>
                {exporting ? "Exporting..." : "Export Excel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;