import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Water.css"
import Temp from "../sensors/temp";
import PhLevel from "../sensors/phlevel";

const Water = () => {
  return (
    <div className="water">
        <Navbar />
    <div className="water-container">
        <Sidebar />
      <div className="water-contents">
        {/* <Meter/> */}
      </div>
    </div>
    </div>
  );
};

export default Water;