// src/pages/dashboard/SectionView.jsx
import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sectionsData from "../data/section"; // ← import your sections config

const sectionComponents = {
  Introduction: React.lazy(() => import("../pages/dashboard/intro")),
  Learn: React.lazy(() => import("../pages/dashboard/learn")),
  Practice: React.lazy(() => import("../pages/dashboard/practice")),
  Quiz: React.lazy(() => import("../pages/dashboard/quiz")),
};

export default function SectionView() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const topicKey = params.get("topic") || "";
  const sectionKey = params.get("section");
  const rawPage = params.get("page");
  const page = rawPage !== null ? parseInt(rawPage, 10) : 1;

  // ——— NEW: build the linear “cards” sequence ———
  const sectionEntry = sectionsData.find((s) => s.key === topicKey);
  const sizes = sectionEntry?.sectionSizes || {};
  const allSecs = ["Introduction", "Learn", "Practice", "Quiz"];

  // first an overview (page 0)
  const cards = [{ section: "Introduction", page: 0 }];

  // then interleave pages 1…max
  const maxPages = Math.max(...allSecs.map((s) => sizes[s] || 0));
  for (let p = 1; p <= maxPages; p++) {
    allSecs.forEach((sec) => {
      if (p <= (sizes[sec] || 0)) {
        cards.push({ section: sec, page: p });
      }
    });
  }

  // find current index, plus prev/next
  const idx = cards.findIndex(
    (c) => c.section === sectionKey && c.page === page
  );
  const prev = idx > 0 ? cards[idx - 1] : null;
  const next = idx < cards.length - 1 ? cards[idx + 1] : null;
  // ————————————————————————————————————————

  const Comp = sectionComponents[sectionKey];
  if (!Comp) return <p>Unknown section: {sectionKey}</p>;

  // Build your title exactly as before
  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const headerText =
    sectionKey === "Introduction" && page === 0
      ? `${titleCase(topicKey)} — Overview`
      : `${titleCase(sectionKey)} ${page}`;

  useEffect(() => {
    document.title = headerText;
  }, [headerText]);

  return (
    <div className="main-dashboard">
      <h1>{headerText}</h1>

      <React.Suspense fallback={<p>Loading…</p>}>
        <Comp currentPage={page} topicKey={topicKey} />
      </React.Suspense>
      {/* ← BACK / NEXT → */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "1rem 0",
        }}
      >
        <button
          onClick={() =>
            prev &&
            navigate(
              `/dashboard?topic=${topicKey}&section=${prev.section}&page=${prev.page}`
            )
          }
          disabled={!prev}
        >
          ← Back
        </button>

        <button
          onClick={() =>
            next &&
            navigate(
              `/dashboard?topic=${topicKey}&section=${next.section}&page=${next.page}`
            )
          }
          disabled={!next}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
