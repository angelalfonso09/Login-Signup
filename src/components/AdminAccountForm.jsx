import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import "../styles/AdminAccountForm.css"; // Ensure this file is created

const AdminCreationForm = () => {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin Created:", adminData);
    // Add API call or further logic here
  };

  return (
    <Container className="admin-form-container">
      <Card className="admin-form-card">
        <Card.Body>
          <h2 className="admin-form-title">Create Admin</h2>
          <Form onSubmit={handleSubmit}>
            {/* Name Field */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Admin Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={adminData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="admin-form-input"
                required
              />
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={adminData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="admin-form-input"
                required
              />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={adminData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="admin-form-input"
                required
              />
            </Form.Group>

            {/* Role Dropdown */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={adminData.role}
                onChange={handleChange}
                className="admin-form-input"
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </Form.Control>
            </Form.Group>

            {/* Buttons */}
            <div className="admin-form-buttons">
              <Button variant="primary" type="submit" className="admin-form-submit">
                Create Admin
              </Button>
              <Button variant="secondary" type="reset" className="admin-form-reset" onClick={() => setAdminData({ name: "", email: "", password: "", role: "Admin" })}>
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCreationForm;
