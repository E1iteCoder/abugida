// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from "react";
import "../styles/themeToggle.css";

export default function ThemeToggle() {
  // 1. read initial state from localStorage or default to light
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    // if they’ve saved “dark” before, honor that
    if (saved === "dark") return true;
    // otherwise defaults to light
    return false;
  });

  // 2. whenever `dark` changes, flip the attribute and persist
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <label className="theme-toggle">
      <input
        type="checkbox"
        checked={dark}
        onChange={() => setDark((d) => !d)}
      />
      <span className="slider" />
      <span className="label">{dark ? "Dark" : "Light"}</span>
    </label>
  );
}
