import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import "../styles/lightmode.css";
import Meter from "../components/Meter";

const Dashboard = ({ theme, toggleTheme }) => {
  return (
    <div className={`db ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="db-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="db-contents">
          <Meter/>
          <Meter/>
          <Meter/>
          <Meter/>
          <Meter/>
          <Meter/>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
