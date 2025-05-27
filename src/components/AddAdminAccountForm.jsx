import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap"; // Import Alert for messages
import axios from "axios";
import "../styles/Components Css/AdminAccountForm.css"; // Assuming this path is correct

const AdminCreationForm = ({ onClose, onAddAdmin }) => {
  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Admin",
  });

  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false); // This will now be true after /admin call
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailForOtp, setEmailForOtp] = useState(""); // Stores the email for OTP

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Function to validate password
  const validatePassword = (password) => {
    // Password must be at least 8 characters long
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    // Password must contain at least one number
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null; // Password is valid
  };

  const verifyOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    // --- ADDED FOR DEBUGGING ---
    console.log("Attempting to verify OTP for Admin...");
    console.log("Email being sent for verification:", emailForOtp);
    console.log("OTP being sent for verification:", otp);
    // --- END DEBUGGING ---

    try {
      // Call the NEW admin-specific OTP verification endpoint
      const response = await axios.post("http://localhost:5000/admin/verify-otp", {
        email: emailForOtp, // Use the stored email for verification
        code: otp, // Send as 'code' to match backend
      });

      setSuccessMessage(response.data.message || "OTP verified successfully!");
      // Proceed with admin creation (which is now just a final success state or redirect)
      // If createAdminAccount was meant to finalize something after OTP, keep it.
      // Otherwise, you might just close the modal and indicate success.
      // For this flow, we'll assume createAdminAccount is now just handling cleanup/redirection.
      await createAdminAccount(); // This will now just handle cleanup/success state

    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error);
      setErrorMessage(error.response?.data?.error || "Failed to verify OTP. Please try again.");
    }
  };

  const createAdminAccount = async () => {
    // This function is now primarily for handling post-OTP-verification success/cleanup
    // The actual admin creation (INSERT into DB) happens in the /admin endpoint on the backend.
    setErrorMessage("");
    setSuccessMessage("");

    // Assuming OTP verification was successful and the admin is now 'email_verified=1' in DB.
    // This function will now just handle UI cleanup and notification.

    setSuccessMessage("✅ Admin account fully created and email verified!");
    // You might want to fetch the updated admin list here or redirect
    onAddAdmin({ username: adminData.username, email: adminData.email, role: adminData.role }); // Update parent component

    setTimeout(() => {
      setAdminData({ username: "", email: "", password: "", confirmPassword: "", role: "Admin" });
      setOtp("");
      setShowOtpInput(false);
      setIsOtpSent(false);
      setErrorMessage("");
      setSuccessMessage("");
      setEmailForOtp("");
      onClose();
    }, 1000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminData.username || !adminData.email || !adminData.password || !adminData.confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (adminData.password !== adminData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Validate password using the new function
    const passwordError = validatePassword(adminData.password);
    if (passwordError) {
      setErrorMessage(`❌ ${passwordError}`);
      return;
    }

    // If OTP is not yet sent (i.e., we are submitting the initial form)
    if (!isOtpSent) {
      try {
        // Call the /admin endpoint directly.
        // This endpoint on the backend will handle user creation AND OTP sending.
        const response = await axios.post("http://localhost:5000/admin", {
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
          confirmPassword: adminData.confirmPassword,
          role: adminData.role,
        }, {
          headers: { "Content-Type": "application/json" }
        });

        console.log("Admin creation response from /admin endpoint:", response.data);
        setSuccessMessage(response.data.message); // Display message from backend (e.g., "Please verify your email...")

        // After successful creation and OTP send from backend, show OTP input
        setEmailForOtp(adminData.email); // Store email for verification
        setShowOtpInput(true); // Show the OTP input field
        setIsOtpSent(true); // Indicate that OTP has been sent and we are in verification phase

      } catch (error) {
        console.error("Admin creation error (from /admin endpoint):", error.response?.data || error);
        setErrorMessage(error.response?.data?.error || "Failed to create admin.");
      }
    } else {
      // If OTP is already sent (i.e., we are submitting the OTP)
      verifyOtp();
    }
  };

  return (
    <Container>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="admin-form-group">
            <Form.Label className="admin-form-label">Admin Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={adminData.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              required
              disabled={isOtpSent} // Disable after OTP is sent to prevent changes
            />
          </Form.Group>

          <Form.Group className="admin-form-group">
            <Form.Label className="admin-form-label">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={adminData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              disabled={isOtpSent} // Disable after OTP is sent to prevent changes
            />
          </Form.Group>

          <Form.Group className="admin-form-group">
            <Form.Label className="admin-form-label">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={adminData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              disabled={isOtpSent} // Disable after OTP is sent to prevent changes
            />
          </Form.Group>

          <Form.Group className="admin-form-group">
            <Form.Label className="admin-form-label">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={adminData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              disabled={isOtpSent} // Disable after OTP is sent to prevent changes
            />
          </Form.Group>

          <Form.Group className="admin-form-group">
            <Form.Label className="admin-form-label">Role</Form.Label>
            <Form.Control
              as="select"
              name="role"
              value={adminData.role}
              onChange={handleChange}
              required
              disabled={isOtpSent} // Disable after OTP is sent to prevent changes
            >
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </Form.Control>
          </Form.Group>

          {showOtpInput && (
            <Form.Group className="admin-form-group mt-3">
              <Form.Label className="admin-form-label">OTP</Form.Label>
              <Form.Control
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                required
              />
            </Form.Group>
          )}

          {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}

          <div className="admin-form-buttons">
            {!isOtpSent ? (
              <Button type="submit"> Send OTP</Button> // Changed button text
            ) : (
              <Button type="submit">Verify OTP & Finalize Admin</Button> // Changed button text
            )}
            <Button onClick={onClose} variant="secondary">Cancel</Button>
          </div>
        </Form>
      </Card.Body>
    </Container>
  );
};

export default AdminCreationForm;
