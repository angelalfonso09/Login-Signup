import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/History.css";
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";
import Turbudity from "../sensors/turbudity";
import Tds from "../sensors/Tds";
import Do from "../sensors/Do";
import Conductivity from "../sensors/Conductivity";
import "../styles/lightmode.css";

const History = ({ theme, toggleTheme }) => {
  return (
    <div className={`history ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="history-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="history-contents">
          <Temp theme={theme} />
          <PhLevel theme={theme} />
          <Turbudity theme={theme} />
          <Tds theme={theme} />
          <Do theme={theme} />
          <Conductivity theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default History;
