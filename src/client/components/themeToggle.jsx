import React, { useEffect, useState } from "react";
import "../styles/themeToggle.css";

// Helper function to get theme based on mode
const getThemeFromMode = (currentMode) => {
  if (currentMode === "auto") {
    // Auto mode: dark between 6 PM and 6 AM
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? "dark" : "light";
  } else {
    // Manual mode: use the selected mode directly
    return currentMode; // "light" or "dark"
  }
};

export default function ThemeToggle() {
  // Get theme mode: "auto", "light", or "dark"
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "auto"; // Default to auto mode
  });

  const [theme, setTheme] = useState(() => getThemeFromMode(mode));

  // 1. Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  // 2. Update theme when mode changes
  useEffect(() => {
    const newTheme = getThemeFromMode(mode);
    setTheme(newTheme);
    
    // Save mode preference
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // 3. Auto-update theme based on time (only in auto mode)
  useEffect(() => {
    if (mode !== "auto") return; // Only run in auto mode

    // Update immediately on mount
    const updateTheme = () => {
      const hour = new Date().getHours();
      const newTheme = hour >= 18 || hour < 6 ? "dark" : "light";
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    };

    updateTheme(); // Initial update

    // Check every minute for time-based changes
    const interval = setInterval(updateTheme, 60000);

    return () => clearInterval(interval);
  }, [mode, theme]);

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
  };

  // Get display label for auto option
  const getAutoLabel = () => {
    if (mode === "auto") {
      return `Auto (${theme === "dark" ? "Dark" : "Light"})`;
    }
    return "Auto";
  };

  return (
    <div className="theme-toggle">
      <select
        className="theme-select"
        value={mode}
        onChange={handleModeChange}
        aria-label="Select theme mode"
      >
        <option value="auto">{getAutoLabel()}</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
