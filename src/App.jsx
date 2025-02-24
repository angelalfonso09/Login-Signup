import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccountManagement from "./pages/AccountManagement";
import Water from "./pages/Water";
import History from "./pages/History";


import "./styles/common/App.css";

import "./components/ForgotPasswordForm";
import "./components/LoginForm";
import "./components/SignupForm";
import "./components/SocialLogin";
import "./components/Navbar";
import "./components/AdminAccountForm";
import "./components/Meter";
import "./components/AccountTable";

function App() {
  // Theme state
  const [theme, setTheme] = React.useState(localStorage.getItem("theme") || "dark");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // Apply theme globally
    localStorage.setItem("theme", theme); // Store in local storage
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  console.log("Theme changed to:", theme);

  return (
<Router>
  <div className={`app-container ${theme}`}>
    <Routes>
      <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/accountmanagement" element={<AccountManagement theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/signup" element={<Signup theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/forgotpassword" element={<ForgotPassword theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/water" element={<Water theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/history" element={<History theme={theme} toggleTheme={toggleTheme} />} />
    </Routes>
  </div>
</Router>
  );
}

export default App;
