import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/History.css"
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";
import Turbudity from "../sensors/turbudity";
import Tds from "../sensors/Tds";
import Do from "../sensors/Do";
import Conductivity from "../sensors/Conductivity";

const History = () => {
  return (
    <div className="history">
        <Navbar />
    <div className="history-container">
        <Sidebar />
      <div className="history-contents">
        <Temp/>
        <PhLevel/>
        <Turbudity/>
        <Tds/>
        <Do/>
        <Conductivity/>
      </div>
    </div>
    </div>
  );
};

export default History;