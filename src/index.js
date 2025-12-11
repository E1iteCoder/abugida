import React from "react";
import { createRoot } from "react-dom/client";
import App from "./client/app";
import "./client/components/themeInitializer"; // Initialize theme on app load

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

