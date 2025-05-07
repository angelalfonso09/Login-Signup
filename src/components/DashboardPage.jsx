import React, { useState, useContext } from 'react';
import { Search } from 'lucide-react';
import '../styles/Components Css/DashboardPage.css';
import { ThemeContext } from '../context/ThemeContext'; // adjust path as needed

const DashboardSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useContext(ThemeContext); // access current theme

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="w-full">
      <div className="dashboard-search-input-wrapper">
        <input
          type="text"
          placeholder="Search establishments..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="dashboard-search-input"
        />
        <Search className="ml-3 w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
};

const DashboardSummary = ({ totalEstablishments, totalSensors, totalUsers }) => {
  const { theme } = useContext(ThemeContext); 

  return (
    <div className="dashboard-summary-container">
      <div className="dashboard-summary-card">
        <div className="dashboard-summary-header">
          <h2 className="dashboard-summary-title">Total Establishments</h2>
        </div>
        <div className="dashboard-summary-content">
          <p className="dashboard-summary-value-blue">{totalEstablishments}</p>
        </div>
      </div>

      <div className="dashboard-summary-card">
        <div className="dashboard-summary-header">
          <h2 className="dashboard-summary-title">Total Sensors</h2>
        </div>
        <div className="dashboard-summary-content">
          <p className="dashboard-summary-value-green">{totalSensors}</p>
        </div>
      </div>

      <div className="dashboard-summary-card">
        <div className="dashboard-summary-header">
          <h2 className="dashboard-summary-title">Total Users</h2>
        </div>
        <div className="dashboard-summary-content">
          <p className="dashboard-summary-value-purple">{totalUsers}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const dashboardSummaryData = {
    totalEstablishments: 125,
    totalSensors: 540,
    totalUsers: 320,
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-title">Dashboard</h1>
      <DashboardSearch />
      <DashboardSummary
        totalEstablishments={dashboardSummaryData.totalEstablishments}
        totalSensors={dashboardSummaryData.totalSensors}
        totalUsers={dashboardSummaryData.totalUsers}
      />
    </div>
  );
};

export default DashboardPage;
