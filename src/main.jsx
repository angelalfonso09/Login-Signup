import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../src/styles/bg.css";

// Import Bootstrap styles
import "bootstrap/dist/css/bootstrap.min.css";
// Import Bootstrap JavaScript (only needed if using tooltips, popovers, etc.)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
