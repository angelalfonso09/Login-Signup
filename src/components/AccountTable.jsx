import React, { useState, useEffect } from "react";
import { Table, Container, Form, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react";
import AdminCreationForm from "./AdminAccountForm";
import axios from "axios";
import "../styles/AC.css";

const UserAdminTable = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ username: "", email: "", phone: "" });

  // Fetch all users from the backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:5000/api/users");
        setAccounts(response.data);
      } catch (err) {
        setError("Failed to fetch users.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccounts();
  }, []); // 🚀 Only fetch on initial render (no need to refetch every time)
  
  // Function to add a new admin
  const handleAddAdmin = async (newAdmin) => {
    try {
      const response = await axios.post("http://localhost:5000/api/users", newAdmin);
  
      if (response.status === 201) {
        const createdUser = response.data; // Get newly created user from backend
  
        // ✅ Update state immediately to reflect UI changes
        setAccounts((prevAccounts) => [...prevAccounts, createdUser]);
        
        console.log("✅ New admin added:", createdUser);
      }
    } catch (error) {
      console.error("❌ Error creating admin:", error);
    } finally {
      setShowAdminModal(false);
    }
  };
  
  // Function to delete a user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
  
    console.log("Attempting to delete user with ID:", id);
  
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
  
      // Update the UI immediately
      setAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== id));
  
      console.log("User deleted successfully, updating state...");
  
      // Fetch updated users from the backend to ensure consistency
      const { data } = await axios.get("http://localhost:5000/api/users");
      setAccounts(data);
      
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  
  
  
  // Function to open edit modal with selected user's details
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({ username: user.username, email: user.email, phone: user.phone || "" });
    setShowEditModal(true);
  };

  // Function to update user details
  const handleEditSubmit = async () => {
    try {
      setEditError(null);
      const response = await axios.put(`http://localhost:5000/api/users/${editingUser.id}`, editFormData);

      if (response.status === 200) {
        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => (acc.id === editingUser.id ? { ...acc, ...editFormData } : acc))
        );
        setShowEditModal(false);
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      setEditError("Failed to update user details.");
      console.error("Error updating user:", err);
    }
  };

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Filter users based on search term and role
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
        <Form.Select className="table-filter" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="All">All</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </Form.Select>
        <Button className="create-admin-btn" onClick={() => setShowAdminModal(true)}>
          Create Admin
        </Button>
      </div>

      {/* Loading State */}
      {loading && <Spinner animation="border" />}

      {/* Error Messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      {/* Table */}
      {!loading && !error && (
        <Table striped bordered hover className={`account-table ${theme}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
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
                  <td>{account.phone || "N/A"}</td>
                  <td>{account.role}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleEdit(account)}>
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
                <td colSpan="6" className="no-results">
                  No users found
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={editFormData.username}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={editFormData.phone}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserAdminTable;
