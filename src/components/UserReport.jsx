import React, { useState } from "react";
import "../styles/UserReport.css";

const UserReport = ({ onSubmit, onClose }) => {
  const [report, setReport] = useState({ title: "", description: "", date: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport({ ...report, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!report.title.trim() || !report.description.trim()) {
      alert("Both fields are required!");
      return;
    }
    onSubmit(report);
    onClose(); // Close modal after submission
  };

  return (
    <div className="report-form-container">
      <form className="report-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={report.title}
          onChange={handleChange}
          placeholder="Enter report title"
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={report.description}
          onChange={handleChange}
          placeholder="Enter report description"
          rows="4"
          required
        ></textarea>

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={report.date}
          onChange={handleChange}
          required
        />

        <div className="modal-actions">
          <button className="submit-btn" type="submit">Create Report</button>
          <button className="cancel-btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UserReport;
