// src/pages/dashboard/SectionView.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/dashboard/sectionCard.css";
import Overview from "./Overview";
// …lazy imports for Intro/Learn/Practice/Quiz…
const sectionComponents = {
  Introduction: React.lazy(() => import("./intro")),
  Learn: React.lazy(() => import("./learn")),
  Practice: React.lazy(() => import("./practice")),
  Quiz: React.lazy(() => import("./quiz")),
};

export default function SectionView() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const topicKey = params.get("topic");
  const section = params.get("section");
  const page = parseInt(params.get("page"), 10) || 1;

  if (section === "Introduction" && page === 0) {
    return (
      <div className="main-dashboard">
        <button
          onClick={() => navigate("/dashboard")}
          className="back"
          aria-label="Toggle Dashboard Menu"
        >
          ← Back
        </button>
        <h1>{topicKey} — Overview</h1>
        <Overview topicKey={topicKey} />
      </div>
    );
  }

  // Otherwise load the normal per-page component
  const Comp = sectionComponents[section];
  if (!Comp) return <p>Unknown section: {section}</p>;

  return (
    <div className="main-dashboard">
      <h1>
        {section} {page}
      </h1>
      <React.Suspense fallback={<p>Loading…</p>}>
        <Comp currentPage={page} topicKey={topicKey} />
      </React.Suspense>
    </div>
  );
}
