import React, { useState, useEffect, useContext } from "react";
import { Table, Container, Form, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { Pencil, Trash2, Plus } from "lucide-react";
import AdminCreationForm from "./AddAdminAccountForm";
import axios from "axios";
import "../styles/Components Css/AccountManagementTable.css";
import { ThemeContext } from "../context/ThemeContext";

const UserAdminTable = () => {
  const { theme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/users");
        setAccounts(response.data);
      } catch (err) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleAddAdmin = async (newAdmin) => {
    try {
      const response = await axios.post("http://localhost:5000/api/users", newAdmin);
      if (response.status === 201) {
        setAccounts((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
    } finally {
      setShowAdminModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({ username: user.username, email: user.email || "" });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditError(null);
      await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, editFormData);
      setAccounts((prev) => prev.map((acc) => (acc.id === editingUser.id ? { ...acc, ...editFormData } : acc)));
      setShowEditModal(false);
    } catch (err) {
      setEditError("Failed to update user details.");
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const filteredAccounts = accounts.filter((account) =>
    (filterRole === "All" || account.role === filterRole) &&
    (account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container className={`acctbl-container ${theme}`}>

      <header>
      <h1 className="Table-title">Account Management</h1>
      </header>

      <div className="acctbl-controls">
        <Form.Control
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="acctbl-search"
        />
        <Form.Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="acctbl-filter"
        >
          <option value="All">All</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </Form.Select>
        <Button onClick={() => setShowAdminModal(true)} className="acctbl-create-btn">
          <Plus size={16} />
        </Button>
      </div>

      {loading && <Spinner animation="border" />} 
      {error && <Alert variant="danger">{error}</Alert>}

      <Table className="acctbl-table">
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
                  <button className="acctbl-create-btn" onClick={() => handleEdit(account)}>
                    <Pencil size={16} />
                  </button>
                  <button className="acctbl-create-btn" onClick={() => handleDelete(account.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminCreationForm onClose={() => setShowAdminModal(false)} onAddAdmin={handleAddAdmin} />
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control name="username" value={editFormData.username} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={editFormData.email} onChange={handleInputChange} />
            </Form.Group>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <Button type="submit" className="acctbl-create-btn">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserAdminTable;
