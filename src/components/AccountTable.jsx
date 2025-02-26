import React, { useState, useEffect } from "react";
import { Table, Container, Form, Button, Modal } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react"; 
import AdminCreationForm from "./AdminAccountForm"; 
import axios from "axios"; 
import "../styles/AC.css";

const UserAdminTable = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [accounts, setAccounts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from the database
  const fetchUsersAndAdmins = async () => {
    try {
      // Fetch users
      const usersResponse = await fetch("http://localhost:5000/api/users");
      if (!usersResponse.ok) throw new Error(`Users API error: ${usersResponse.status}`);
      const users = await usersResponse.json();
  
      // Fetch admins
      const adminsResponse = await fetch("http://localhost:5000/api/admin");
      if (!adminsResponse.ok) throw new Error(`Admins API error: ${adminsResponse.status}`);
      const admins = await adminsResponse.json();
  
      return { users, admins };
    } catch (error) {
      console.error("Error fetching users and admins:", error);
      return { users: [], admins: [] };
    }
  };
  
  // Example usage
  fetchUsersAndAdmins().then((data) => {
    console.log("Users:", data.users);
    console.log("Admins:", data.admins);
  });
  
  

  const handleAddAdmin = (newAdmin) => {
    setAccounts([...accounts, { id: accounts.length + 1, ...newAdmin }]);
    setShowAdminModal(false);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const handleEdit = (id) => {
    console.log(`Edit clicked for user ID: ${id}`);
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      (filterRole === "All" || account.role === filterRole) &&
      (account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container className={`table-container ${theme}`}>
      <h2 className="table-title">User & Admin Accounts</h2>

      {/* Search, Filter & Create Admin */}
      <div className="table-controls">
        <Form.Control
          type="text"
          placeholder="Search by username or email..."
          className="table-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Form.Select
          className="table-filter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </Form.Select>
        <Button className="create-admin-btn" onClick={() => setShowAdminModal(true)}>
          Create Admin
        </Button>
      </div>

      {/* Loading State */}
      {loading && <p>Loading users...</p>}

      {/* Error State */}
      {error && <p className="error-message">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <Table striped bordered hover className={`account-table ${theme}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.id}</td>
                  <td>{account.username}</td>
                  <td>{account.email}</td>
                  <td>{account.role}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleEdit(account.id)}>
                      <Pencil size={16} />
                    </button>
                    <button className="action-btn" onClick={() => handleDelete(account.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Create Admin Modal */}
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminCreationForm onClose={() => setShowAdminModal(false)} onAddAdmin={handleAddAdmin} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserAdminTable;
