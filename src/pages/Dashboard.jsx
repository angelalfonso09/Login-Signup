import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css"

const Dashboard = () => {
  return (
    <div className="db-container">
        <Navbar />
      <div className="main-container">
        <div className="contents">
      <Sidebar />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
