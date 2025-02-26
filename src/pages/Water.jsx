import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Water.css";
import Meter from "../components/Meter";


const Water = ({ theme, toggleTheme }) => {
  return (
    <div className={`water ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="water-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="water-contents">
          <Meter/>


          
        </div>
      </div>
    </div>
  );
};

export default Water;
