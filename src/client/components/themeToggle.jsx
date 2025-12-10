import React, { useEffect, useState } from "react";
import "../styles/themeToggle.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved : new Date().getHours() >= 18 ? "dark" : "light";
  });

  // 1. Apply theme to DOM and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 2. Live time updates - ONLY if no saved user preference
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("theme");
      // Skip if user has manually set a preference
      if (saved && !saved.startsWith("auto-")) return;
      
      const hour = new Date().getHours();
      const newTheme = hour >= 18 || hour < 6 ? "dark" : "light";
      
      // Only update if different from current
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme]); // Re-run if theme changes manually

  const toggleTheme = () => {
    // Clear auto mode when user manually toggles
    localStorage.removeItem("theme");
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <label className="theme-toggle">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <span className="slider" />
      <span className="label">{theme === "dark" ? "Dark" : "Light"}</span>
    </label>
  );
}
