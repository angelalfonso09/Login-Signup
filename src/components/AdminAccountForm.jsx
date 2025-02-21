import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";
import axios from "axios";
import "../styles/AdminAccountForm.css"; 

const AdminCreationForm = () => {
  const [adminData, setAdminData] = useState({
    username: "", // Fixed from "admin" to "username"
    email: "",
    password: "",
    confirmPassword: "",
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

    // Validate fields
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
        username: adminData.username,  // Fixed key from "admin" to "username"
        email: adminData.email,
        password: adminData.password,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      setSuccessMessage("✅ Admin created successfully!");
      setAdminData({ username: "", email: "", password: "", confirmPassword: "" });

    } catch (error) {
      console.error("Admin creation error:", error.response?.data || error);
      setErrorMessage(error.response?.data?.error || "Failed to create admin.");
    }
  };

  return (
    <Container className="admin-form-container">
      <Card className="admin-form-card">
        <Card.Body>
          <h2 className="admin-form-title">Create Admin</h2>
          <Form onSubmit={handleSubmit}>
            {/* Username Field */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Admin Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={adminData.username}
                onChange={handleChange}
                placeholder="Enter admin username"
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

            {/* Confirm Password Field */}
            <Form.Group className="admin-form-group">
              <Form.Label className="admin-form-label">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={adminData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="admin-form-input"
                required
              />
            </Form.Group>

            {/* Error and Success Messages */}
            {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
            {successMessage && <p className="text-success mt-3">{successMessage}</p>}

            {/* Buttons */}
            <div className="admin-form-buttons">
              <Button variant="primary" type="submit" className="admin-form-submit">
                Create Admin
              </Button>
              <Button variant="secondary" type="reset" className="admin-form-reset" onClick={() => setAdminData({ username: "", email: "", password: "", confirmPassword: "" })}>
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
