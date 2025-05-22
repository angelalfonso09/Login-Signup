import React, { useState, useContext, useEffect } from 'react'; // Import useEffect
import { Search } from 'lucide-react';
import '../styles/Components Css/DashboardPage.css';
import { ThemeContext } from '../context/ThemeContext';

const DashboardSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useContext(ThemeContext);

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
          {/* Display totalUsers here. Add a fallback like 0 or a loading indicator */}
          <p className="dashboard-summary-value-purple">
            {totalUsers !== null ? totalUsers : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
};



const DashboardPage = () => {
  const [dashboardSummaryData, setDashboardSummaryData] = useState({
    totalEstablishments: 0, 
    totalSensors: 0,      
    totalUsers: null,    
  });

    useEffect(() => {
        const fetchTotalUsers = async () => {
            setDashboardSummaryData(prevData => ({ ...prevData, userError: false })); // Reset error on new attempt
            try {
                const response = await fetch('http://localhost:5000/api/total-users');
                if (!response.ok) {
                    // Try to parse error message from backend if available
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.error || 'Failed to fetch'}`);
                }
                const data = await response.json();
                setDashboardSummaryData(prevData => ({
                    ...prevData,
                    totalUsers: data.totalUsers,
                    userError: false, // Ensure error is false on success
                }));
            } catch (error) {
                console.error("Error fetching total users:", error);
                setDashboardSummaryData(prevData => ({
                    ...prevData,
                    totalUsers: null, 
                    userError: true, 
                }));
            }
        };

const fetchOtherData = async () => {
  try {
    const estResponse = await fetch('http://localhost:5000/api/total-establishments');
    if (!estResponse.ok) {
      const errorData = await estResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! Status: ${estResponse.status}. Message: ${errorData.error || 'Failed to fetch'}`);
    }

    const estData = await estResponse.json();
    setDashboardSummaryData(prevData => ({
      ...prevData,
      totalEstablishments: estData.totalEstablishments,
    }));
  } catch (error) {
    console.error("Error fetching total establishments:", error);
    setDashboardSummaryData(prevData => ({
      ...prevData,
      totalEstablishments: 0, // fallback value on error
    }));
  }

 // ✅ Fetch total sensors
  try {
    const sensorResponse = await fetch('http://localhost:5000/api/total-sensors');
    if (!sensorResponse.ok) {
      const errorData = await sensorResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! Status: ${sensorResponse.status}. Message: ${errorData.error || 'Failed to fetch'}`);
    }

    const sensorData = await sensorResponse.json();
    setDashboardSummaryData(prevData => ({
      ...prevData,
      totalSensors: sensorData.totalSensors,
    }));
  } catch (error) {
    console.error("Error fetching total sensors:", error);
    setDashboardSummaryData(prevData => ({
      ...prevData,
      totalSensors: 0, 
    }));
  }
};

    fetchTotalUsers();
    fetchOtherData(); 
  }, []); 

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