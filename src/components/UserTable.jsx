import React, { useState } from "react";
import "../styles/UserTable.css"; // Import CSS

const UserTable = () => {
  // Sample user data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin" },
    { id: 3, name: "Alice Brown", email: "alice@example.com", role: "User" },
  ];

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    userId: "",
    title: "",
    description: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Report Submitted:", newReport);
    setIsModalOpen(false);
    setNewReport({ userId: "", title: "", description: "" }); // Reset form
  };

  return (
    <div className="user-table-container">
      <h2>Users</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="add-report-btn" onClick={() => setIsModalOpen(true)}>
                  Add Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit a Report</h3>
            <form onSubmit={handleSubmit}>
              <label>User ID:</label>
              <input
                type="number"
                name="userId"
                value={newReport.userId}
                onChange={handleChange}
                required
              />

              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={newReport.title}
                onChange={handleChange}
                required
              />

              <label>Description:</label>
              <textarea
                name="description"
                value={newReport.description}
                onChange={handleChange}
                required
              ></textarea>

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
