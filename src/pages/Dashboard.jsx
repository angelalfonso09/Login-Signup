import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const Dashboard = ({ theme, toggleTheme }) => {
  return (
    <div className={`db ${theme}`}> {/* Apply dynamic theme class */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="db-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="db-contents">
          {/* Add dashboard content here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
