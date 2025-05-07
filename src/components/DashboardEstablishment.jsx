import React, { useState } from 'react';
import '../styles/Establishment.css';

import Turbidity from "../Dashboard Meters/Turbidity";
import Ph from "../Dashboard Meters/Ph";
import Tds from "../Dashboard Meters/Tds";
import Conductivity from "../Dashboard Meters/Conductivity";
import Salinity from "../Dashboard Meters/Salinity";
import Temperature from "../Dashboard Meters/Temperature";
import ElectricalCon from "../Dashboard Meters/ElectricalCon";

const EstablishmentSensors = ({ establishmentName, sensors }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="estab-sensors-container">
      <div className="estab-info">
        <h2 className="estab-name">{establishmentName} National University</h2>
        <p className="estab-sensor-count">Total Sensors: {sensors ? sensors.length : 0}</p>
      </div>
      <button onClick={() => setIsOpen(true)} className="estab-details-button">
        Details
      </button>

      {isOpen && (
        <div className="estab-modal">
          <div className="estab-modal-content">
            <div className="estab-modal-header">
              <h2 className="estab-modal-title">{establishmentName}</h2>
              <p className="estab-modal-description">
                List of sensors for {establishmentName}.
                <br />
                Total Sensors: {sensors ? sensors.length : 0}
              </p>
            </div>

            <div className="estab-sensor-list">
              <div className="meterWidget">
                <div className="meterLabel">Turbidity</div>
                <Turbidity />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">Temperature</div>
                <Temperature />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">Salinity</div>
                <Salinity />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">Conductivity</div>
                <Conductivity />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">Total Dissolved Solids (TDS)</div>
                <Tds />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">pH Level</div>
                <Ph />
              </div>

              <div className="meterWidget">
                <div className="meterLabel">Electrical Conductivity (Compensated)</div>
                <ElectricalCon />
              </div>
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
  );
};

export default EstablishmentSensors;
