// src/components/cardgroup.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard/cardgroup.css";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

export default function CardGroup({
  topicKey, // e.g. "alphabet"
  labelUrl, // e.g. "/labels/alphabet.json"
  sectionSizes, // e.g. { Introduction: 17, Learn: 17, Practice: 17, Quiz: 17 }
}) {
  const defaultSize = 0;
  const allSections = ["Introduction", "Learn", "Practice", "Quiz"];
  const { isAuthenticated } = useAuth();

  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  // Fetch labels
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

  // Fetch user progress
  useEffect(() => {
    if (!isAuthenticated) {
      setProgress(null);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await authAPI.getProgress();
        setProgress(response.progress);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [isAuthenticated, topicKey]);

  // Helper function to check if a card is completed
  const isCardCompleted = (section, page) => {
    if (!progress || !progress.completedSections) return false;
    
    const topicProgress = progress.completedSections[topicKey];
    if (!topicProgress) return false;
    
    const sectionProgress = topicProgress[section];
    if (!sectionProgress) return false;
    
    const pageKey = page.toString();
    return sectionProgress[pageKey] === true;
  };

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
        const isCompleted = isCardCompleted(card.section, card.page);

        return (
          <Link key={card.id} to={card.link}>
            <div className={`card ${isCompleted ? 'completed' : ''}`}>
              {isCompleted && (
                <div className="completion-badge">
                  <span className="checkmark">✓</span>
                </div>
              )}
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
