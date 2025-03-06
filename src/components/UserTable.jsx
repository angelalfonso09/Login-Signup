import React, { useContext, useState } from "react";
import "../styles/UserTable.css";
import { ThemeContext } from "../context/ThemeContext";

const UserTable = () => {
  const { theme } = useContext(ThemeContext);
  const [reports, setReports] = useState([
    { id: 1, title: "Q1 Financial Summary", date: "2025-01-15", time: "10:00 AM", description: "Summary of Q1 financials", status: "Completed" },
    { id: 2, title: "Marketing Campaign Results", date: "2025-01-28", time: "2:30 PM", description: "Analysis of marketing campaign", status: "In Review" },
    { id: 3, title: "Product Development Update", date: "2025-02-05", time: "4:00 PM", description: "Product progress update", status: "Completed" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: "", date: "", time: "", description: "" });

  const handleAddReport = () => {
    if (newReport.title && newReport.date && newReport.time && newReport.description) {
      setReports([...reports, { id: reports.length + 1, ...newReport, status: "Draft" }]);
      setNewReport({ title: "", date: "", time: "", description: "" });
      setShowModal(false);
    }
  };

  return (
    <div className={`reports-container ${theme}`} data-theme={theme}>
      <h2>Reports</h2>
      <table className="reports-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Report</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.date}</td>
              <td>{report.time}</td>
              <td>{report.title}</td>
              <td>{report.description}</td>
              <td className={`status ${report.status.toLowerCase().replace(" ", "-")}`}>{report.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="but">
        <button className="add-report-btn" onClick={() => setShowModal(true)}>+</button>
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Report</h3>
            <label>Title:</label>
            <input type="text" value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} />
            
            <label>Date:</label>
            <input type="date" value={newReport.date} onChange={(e) => setNewReport({ ...newReport, date: e.target.value })} />
            
            <label>Time:</label>
            <input type="time" value={newReport.time} onChange={(e) => setNewReport({ ...newReport, time: e.target.value })} />
            
            <label>Description:</label>
            <textarea value={newReport.description} onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}></textarea>
            
            <div className="modal-buttons">
              <button onClick={handleAddReport}>Add Report</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
