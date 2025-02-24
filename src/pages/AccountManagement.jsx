import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/AccountManagement.css"
import AdminAccountForm from "../components/AdminAccountForm";

const AccountManagement = () => {
  return (
    <div className="account">
        <Navbar />
    <div className="account-container">
        <Sidebar />
      <div className="account-contents">
        <AdminAccountForm/>
      </div>
    </div>
    </div>
  );
};

export default AccountManagement;
