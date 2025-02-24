import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css"

const Dashboard = () => {
  return (
    <div className="db">
        <Navbar />
      <div className="db-container">
        <div className="db-contents">
      <Sidebar />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
