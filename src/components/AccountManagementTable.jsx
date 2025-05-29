import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Container,
  Form,
  Button,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Pencil, Trash2, Plus } from "lucide-react";
import AdminCreationForm from "./AddAdminAccountForm";
import axios from "axios";
import "../styles/Components Css/AccountManagementTable.css";
import { ThemeContext } from "../context/ThemeContext";

const UserAdminTable = () => {
  const { theme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false); // Unique classname
  const [showEditUserModal, setShowEditUserModal] = useState(false); // Unique classname
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
    return () => {
      document.body.classList.remove("dark", "light");
    };
  }, [theme]);

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
      const response = await axios.post(
        "http://localhost:5000/api/users",
        newAdmin
      );
      if (response.status === 201) {
        setAccounts((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
    } finally {
      setShowAddAdminModal(false);
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
    setShowEditUserModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditError(null);
      await axios.put(
        `http://localhost:5000/api/users/${editingUser.id}`,
        editFormData
      );
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingUser.id ? { ...acc, ...editFormData } : acc
        )
      );
      setShowEditUserModal(false);
    } catch (err) {
      setEditError("Failed to update user details.");
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      (filterRole === "All" || account.role === filterRole) &&
      (account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container className={`acctbl-container ${theme}`}>
      <header className="acctbl-header">
        <h1 className="acctbl-title-main">Account Management</h1> {/* Unique classname */}
      </header>

      <div className="acctbl-controls">
        <Form.Control
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="acctbl-search-input" // Unique classname
          
        />
        <Form.Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="acctbl-filter-select" // Unique classname
        >
          <option value="All">All</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </Form.Select>
        <Button
          onClick={() => setShowAddAdminModal(true)}
          className="acctbl-add-btn" // Unique classname
        >
          <Plus size={16} /> Add Admin
        </Button>
      </div>

      {loading && <Spinner animation="border" className="acctbl-spinner" />} {/* Unique classname */}
      {error && <Alert variant="danger" className="acctbl-error-alert">{error}</Alert>} {/* Unique classname */}

      <div className="acctbl-table-scroll-wrapper">
        <Table className="acctbl-data-table"> {/* Unique classname */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Email Verified</th>
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
                  <td>{account.is_verified ? "Yes" : "No"}</td>
                  <td>{account.email_verified ? "Yes" : "No"}</td>
                  <td className="acctbl-actions-cell"> {/* Unique classname */}
                    <button
                      className="acctbl-edit-btn" // Unique classname
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      className="acctbl-delete-btn"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="acctbl-no-data">No users found</td> {/* Unique classname */}
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Admin Creation Modal */}
      <Modal show={showAddAdminModal} onHide={() => setShowAddAdminModal(false)} className="acctbl-add-admin-modal"> {/* Unique classname */}
        <Modal.Header closeButton>
          <Modal.Title>Create Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminCreationForm
            onClose={() => setShowAddAdminModal(false)}
            onAddAdmin={handleAddAdmin}
          />
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)} className="acctbl-edit-user-modal"> {/* Unique classname */}
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3 acctbl-form-group"> {/* Unique classname */}
              <Form.Label className="acctbl-form-label">Username</Form.Label> {/* Unique classname */}
              <Form.Control
                name="username"
                value={editFormData.username}
                onChange={handleInputChange}
                className="acctbl-form-control" // Unique classname
              />
            </Form.Group>
            <Form.Group className="mb-3 acctbl-form-group">
              <Form.Label className="acctbl-form-label">Email</Form.Label>
              <Form.Control
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
                className="acctbl-form-control"
              />
            </Form.Group>
            {editError && <Alert variant="danger" className="acctbl-edit-error-alert">{editError}</Alert>} {/* Unique classname */}
            <Modal.Footer className="acctbl-modal-footer"> {/* Unique classname */}
              <Button type="submit" className="acctbl-save-changes-btn"> {/* Unique classname */}
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowEditUserModal(false)}
                className="acctbl-cancel-edit-btn" // Unique classname
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserAdminTable;