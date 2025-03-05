import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/AccountManagement.css";
import AccountTable from "../components/AccountTable";
import "../styles/theme.css";

const AccountManagement = ({ theme, toggleTheme }) => {
  return (
    <div className={`account ${theme}`}>
      <Navbar />
      <div className="account-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="account-contents">
          {/* <AdminAccountForm /> */}
          <AccountTable/>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
