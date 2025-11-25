// src/components/cardgroup.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard/cardgroup.css";

export default function CardGroup({
  topicKey, // e.g. "alphabet"
  labelUrl, // e.g. "/labels/alphabet.json"
  sectionSizes, // e.g. { Introduction: 17, Learn: 17, Practice: 17, Quiz: 17 }
}) {
  const defaultSize = 0;
  const allSections = ["Introduction", "Learn", "Practice", "Quiz"];

  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(labelUrl);
        if (!resp.ok) throw new Error(`Failed to fetch ${labelUrl}`);
        const data = await resp.json();
        if (!cancelled) setLabels(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [labelUrl]);

  if (loading) return <div>Loading cards…</div>;
  if (error) return <div>Error: {error}</div>;

  // Find the maximum number of pages across all four sections
  const maxPages = Math.max(
    ...allSections.map((sec) => sectionSizes[sec] ?? defaultSize)
  );

  // Build an array of card meta
  const cards = [];

  // 1) The special overview card (page 0)
  cards.push({
    id: `0-${topicKey}`,
    section: "Introduction",
    page: 0,
    title: "Introduction 0",
    link: `/dashboard?topic=${topicKey}&section=Introduction&page=0`,
  });

  // 2) Interleave pages 1…maxPages for each of the 4 sections
  for (let page = 1; page <= maxPages; page++) {
    allSections.forEach((sec, idx) => {
      const size = sectionSizes[sec] ?? defaultSize;
      if (page <= size) {
        cards.push({
          id: idx * 100 + page,
          section: sec,
          page,
          title: `${sec} ${page}`,
          link: `/dashboard?topic=${topicKey}&section=${sec}&page=${page}`,
        });
      }
    });
  }

  // --- Render the grid of cards ---
  return (
    <div className="card-grid">
      {cards.map((card) => {
        // Grab the entry for this page (may be undefined)
        const entry = labels[card.page];

        return (
          <Link key={card.id} to={card.link}>
            <div className="card">
              <h2>{card.title}</h2>

              {card.page === 0 ? (
                <p className="subtitles">Module overview</p>
              ) : entry ? (
                // Render only the label string, not the whole object
                <p className="subtitles">{entry.label}</p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
