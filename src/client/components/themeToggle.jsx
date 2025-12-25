import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";
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
  const { user, isAuthenticated } = useAuth();
  
  // Get theme mode: "auto", "light", or "dark"
  // Priority: user.themeMode (if logged in) > localStorage > "auto"
  const [mode, setMode] = useState(() => {
    if (user?.themeMode) {
      return user.themeMode;
    }
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "auto"; // Default to auto mode
  });

  const [theme, setTheme] = useState(() => getThemeFromMode(mode));
  
  // Sync mode when user data changes (e.g., after login)
  useEffect(() => {
    if (isAuthenticated && user?.themeMode) {
      setMode(user.themeMode);
    } else if (!isAuthenticated) {
      // If logged out, use localStorage
      const savedMode = localStorage.getItem("themeMode");
      if (savedMode) {
        setMode(savedMode);
      }
    }
  }, [user, isAuthenticated]);

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
    const saveThemePreference = async () => {
      // Always save to localStorage as backup
      localStorage.setItem("themeMode", mode);
      
      // If user is logged in, also save to database
      if (isAuthenticated && user) {
        try {
          await authAPI.updatePreferences({ themeMode: mode });
          console.log('Theme preference saved to database');
        } catch (error) {
          console.error('Failed to save theme preference to database:', error);
          // Continue anyway - localStorage is saved
        }
      }
    };
    
    saveThemePreference();
  }, [mode, isAuthenticated, user]);

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
