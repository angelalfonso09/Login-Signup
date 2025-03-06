import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import axios from "axios";
import "../styles/AdminAccountForm.css";

const AdminCreationForm = ({ onClose, onAddAdmin }) => {
  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    console.log("Admin Data before sending:", adminData);

    if (!adminData.username || !adminData.email || !adminData.password || !adminData.confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (adminData.password !== adminData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/admin", {
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        confirmPassword: adminData.confirmPassword,
        role: adminData.role,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Response:", response.data);
      setSuccessMessage("✅ Admin created successfully!");
      onAddAdmin({ username: adminData.username, email: adminData.email, role: adminData.role });

      setTimeout(() => {
        setAdminData({ username: "", email: "", password: "", confirmPassword: "", role: "Admin" });
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Admin creation error:", error.response?.data || error);
      setErrorMessage(error.response?.data?.error || "Failed to create admin.");
    }
  };

  return (
    <Container>
      <Card className="admin-form-card">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="admin-form-group">
              <Form.Label>Admin Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={adminData.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                required
              />
            </Form.Group>

            <Form.Group className="admin-form-group">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={adminData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="admin-form-group">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={adminData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Form.Group className="admin-form-group">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={adminData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </Form.Group>

            {/* Dropdown for Role Selection */}
            <Form.Group className="admin-form-group">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={adminData.role}
                onChange={handleChange}
                required
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </Form.Control>
            </Form.Group>

            {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
            {successMessage && <p className="text-success mt-3">{successMessage}</p>}

            <div className="admin-form-buttons">
              <Button variant="success" type="submit">Create Admin</Button>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCreationForm;
