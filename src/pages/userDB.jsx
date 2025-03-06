import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/UserDB.css";
import "../styles/theme.css";
import Meter from "../components/Meter";
import { ThemeContext } from "../context/ThemeContext";
import UserTable from "../components/UserTable";

const UserDB = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`user ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="user-container">
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        <div className="user-contents">
          {/* Meters */}
          <div className="meter-grid">
            <Meter />
            <Meter />
            <Meter />
            <Meter />
            <Meter />
            <Meter />
          </div>
          <UserTable />
        </div>
      </div>
    </div>
  );
};

export default UserDB;
