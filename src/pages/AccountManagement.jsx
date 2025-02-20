import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/AccountManagement.css"
import AdminAccountForm from "../components/AdminAccountForm";

const AccountManagement = () => {
  return (
    <div className="db-container">
        <Navbar />
    <div className="main-container">
        <Sidebar />
      <div className="contents">
        <AdminAccountForm/>
      </div>
    </div>
    </div>
  );
};

export default AccountManagement;
