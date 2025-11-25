import React, { useEffect, useState } from "react";
import "../styles.css";
import "../styles/settings.css";
import "../styles/themeToggle.css";
import ThemeToggle from "../components/themeToggle.jsx";
export default function Settings() {
  useEffect(() => {
    document.title = "Settings";
  });

  return (
    <div className="main-settings">
      <h1>Settings</h1>
      <div className="settings-container">
        <div className="option-container">
          <h3>System Theme</h3>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
