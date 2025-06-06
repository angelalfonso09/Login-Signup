// EstablishmentSensors.js (updated to include more sensor mappings)

import React, { useState, useEffect } from 'react';
import '../styles/Components Css/Establishment.css';

// Import all your sensor components
import Turbidity from "../Dashboard Meters/Turbidity";
import Ph from "../Dashboard Meters/Ph";
import Tds from "../Dashboard Meters/Tds";
import Conductivity from "../Dashboard Meters/Conductivity";
import Salinity from "../Dashboard Meters/Salinity";
import Temperature from "../Dashboard Meters/Temperature";
import ElectricalCon from "../Dashboard Meters/ElectricalCon"; // Import the ElectricalCon component

// Import Font Awesome for icons
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome CSS is imported

// IMPORTANT: Map your sensor names (exactly as they appear in your 'sensors' table and backend response)
// to their corresponding React components. If a sensor type doesn't have a component, you can map it to `null`.
const sensorComponentMap = {
  // Updated/Added mappings based on your screenshot's displayed names (lowercase)
  "turbidity": Turbidity, // Mapping "turbidity" to Turbidity component
  "ph": Ph,             // Mapping "ph" to Ph component
  "tds": Tds,           // Mapping "tds" to Tds component
  "conductivity": Conductivity, // This handles the 'conductivity' sensor
  "salinity": Salinity, // Mapping "salinity" to Salinity component
  "temperature": Temperature, // Mapping "temperature" to Temperature component
  "ec": ElectricalCon,  // Mapped 'ec' to ElectricalCon

  // Keep these if they are alternative or more formal names from your backend/database:
  "Turbidity Sensor": Turbidity,
  "pH Sensor": Ph,
  "TDS Sensor": Tds,
  "Conductivity Sensor": Conductivity,
  "Salinity Sensor": Salinity,
  "Temperature Sensor A": Temperature, // Assuming this was an example or a specific sensor
  "Electrical Conductivity (Compensated)": ElectricalCon,

  // Keep these if you don't have dedicated components yet:
  "Humidity Sensor B": null,
  "CO2 Sensor C": null,
  "Light Sensor D": null,
  "Motion Sensor E": null,
  // Add all other sensor names and their corresponding components here
};


// Now accepts 'establishment' object prop and 'onDelete' function prop
const EstablishmentSensors = ({ establishment, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Destructure name and sensors from the establishment object
  const establishmentName = establishment.name;
  // Ensure sensors is an array, even if empty or undefined
  const sensors = Array.isArray(establishment.sensors) ? establishment.sensors : [];

  return (
    <div className="estab-sensors-wrapper">
      <div className="estab-sensors-container">
        <div className="estab-info">
          <h2 className="estab-name">{establishmentName}</h2>
          {/* Display the count of sensors explicitly assigned to this establishment */}
          <p className="estab-sensor-count">Total Sensors: {sensors.length}</p>
        </div>
        <div className="estab-actions">
          <button onClick={() => setIsOpen(true)} className="estab-details-button">
            Details
          </button>
          <button
            onClick={() => onDelete(establishment.id, establishment.name)}
            className="estab-delete-icon-button"
            title={`Delete ${establishmentName}`}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>

        {isOpen && (
          <div className="estab-modal">
            <div className="estab-modal-content">
              <div className="estab-modal-header">
                <h2 className="estab-modal-title">{establishmentName}</h2>
                <p className="estab-modal-description">
                  List of sensors for {establishmentName}
                  <br />
                  Total Sensors: {sensors.length}
                </p>
              </div>

              <div className="estab-sensor-list">
                {sensors.length > 0 ? (
                  // Map over the sensors associated with this establishment
                  sensors.map((sensor) => {
                    // *** THIS CONSOLE LOG IS CRUCIAL FOR DEBUGGING ***
                    // It will show the exact sensor name from your backend.
                    // If a component still doesn't show, check this log for the name
                    // and ensure sensorComponentMap has an exact key match.
                    console.log(`Processing sensor: ID=${sensor.id}, Name="${sensor.name}"`);

                    const SensorComponent = sensorComponentMap[sensor.name];
                    if (SensorComponent) {
                      return (
                        <div key={sensor.id} className="meterWidget">
                          {/* Use the sensor's name from the backend for the label */}
                          <div className="meterLabel">{sensor.name}</div>
                          <SensorComponent /> {/* Render the specific sensor component */}
                        </div>
                      );
                    } else {
                      // Fallback for sensor types without a specific component
                      return (
                        <div key={sensor.id} className="meterWidget missing-component">
                          <div className="meterLabel">{sensor.name}</div>
                          <p>No dedicated display component for this sensor type.</p>
                        </div>
                      );
                    }
                  })
                ) : (
                  <p className="no-sensors-assigned">No sensors currently assigned to this establishment.</p>
                )}
              </div>

              <div className="estab-modal-footer">
                <button onClick={() => setIsOpen(false)} className="estab-modal-close-button">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstablishmentSensors;
