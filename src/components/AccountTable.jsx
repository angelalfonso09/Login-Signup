import React, { useState } from "react";
import { Table, Container, Form, Button, Modal } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react"; // Import icons
import AdminCreationForm from "./AdminAccountForm"; // Import your admin form component
import "../styles/AC.css";

const UserAdminTable = ({ theme }) => {
  const [accounts, setAccounts] = useState([
    { id: 1, username: "john_doe", email: "john@example.com", role: "User" },
    { id: 2, username: "admin_1", email: "admin@example.com", role: "Admin" },
    { id: 3, username: "jane_smith", email: "jane@example.com", role: "User" },
    { id: 4, username: "superadmin", email: "superadmin@example.com", role: "Admin" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleAddAdmin = (newAdmin) => {
    setAccounts([...accounts, { id: accounts.length + 1, ...newAdmin }]);
    setShowAdminModal(false);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const handleEdit = (id) => {
    console.log(`Edit clicked for user ID: ${id}`);
    // Here, you can open an edit modal or navigate to an edit page
  };

  const filteredAccounts = accounts.filter((account) =>
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

      {/* Table */}
{/* Table */}
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
                        <button className="action-btn">
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
