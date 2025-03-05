import React, { useContext, useState } from "react";
import "../styles/ReportsTable.css";
import { ThemeContext } from "../context/ThemeContext"; // Import ThemeContext

const Reports = () => {
  const { theme } = useContext(ThemeContext); // Use ThemeContext

  // Sample data - replace with your actual data source
  const [reports, setReports] = useState([
    { id: 1, title: "Q1 Financial Summary", author: "Jane Smith", date: "2025-01-15", status: "Completed", type: "Financial" },
    { id: 2, title: "Marketing Campaign Results", author: "John Doe", date: "2025-01-28", status: "In Review", type: "Marketing" },
    { id: 3, title: "Product Development Update", author: "Alex Johnson", date: "2025-02-05", status: "Completed", type: "Product" },
    { id: 4, title: "HR Quarterly Review", author: "Sarah Williams", date: "2025-02-10", status: "Draft", type: "HR" },
    { id: 5, title: "Sales Performance Analysis", author: "Mike Chen", date: "2025-02-20", status: "Completed", type: "Sales" },
    { id: 6, title: "Operations Efficiency Report", author: "Lisa Taylor", date: "2025-02-25", status: "In Review", type: "Operations" },
  ]);

  return (
    <div className={`reports-container ${theme}`} data-theme={theme}>
      <h2>Reports</h2>
      <table className="reports-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Report</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.date}</td>
              <td>{report.title}</td>
              <td className={`status ${report.status.toLowerCase().replace(" ", "-")}`}>
                {report.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
