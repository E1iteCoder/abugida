// src/pages/dashboard.jsx
import { React, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleChooser from "../components/ModuleChooser";
import SectionView from "../components/SectionView";
import UserProgress from "../components/UserProgress";
import "../styles/dashboard/dashboard.css";

export default function Dashboard() {
  const { search } = useLocation();
  const hasSection = new URLSearchParams(search).has("section");
  const navigate = useNavigate();
  // only set the title when we are on the "module chooser" screen
  useEffect(() => {
    if (!hasSection) {
      document.title = "Dashboard";
    }
  }, [hasSection]); // <-- re-run _only_ when hasSection changes

  // A "Back" button that only makes sense in SectionView
  const backButton = (
    <button onClick={() => navigate("/dashboard")} className="back">
      ← Back to Modules
    </button>
  );

  return (
    <div className="main-dashboard">
      {hasSection ? (
        <>
          <SectionView />
          {backButton}
        </>
      ) : (
        <>
          <UserProgress />
          <ModuleChooser />
        </>
      )}
    </div>
  );
}
