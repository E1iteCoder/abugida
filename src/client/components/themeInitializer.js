// Initialize theme on app load - runs before any components mount
export function initializeTheme() {
  // Check for old theme format and migrate if needed
  const oldTheme = localStorage.getItem("theme");
  if (oldTheme && !localStorage.getItem("themeMode")) {
    // Migrate old "light"/"dark" to new format
    if (oldTheme === "light" || oldTheme === "dark") {
      localStorage.setItem("themeMode", oldTheme);
      localStorage.removeItem("theme");
    }
  }
  
  const savedMode = localStorage.getItem("themeMode") || "auto";
  
  let theme;
  if (savedMode === "auto") {
    // Auto mode: dark between 6 PM (18:00) and 6 AM (06:00)
    const hour = new Date().getHours();
    theme = hour >= 18 || hour < 6 ? "dark" : "light";
  } else {
    // Manual mode: use saved preference
    theme = savedMode; // "light" or "dark"
  }
  
  // Apply theme to DOM immediately
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  
  return { mode: savedMode, theme };
}

// Run initialization immediately when this module loads
initializeTheme();

