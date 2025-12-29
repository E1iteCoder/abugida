// src/pages/dashboard/learn.jsx
import React, { useState, useEffect } from "react";
import "../styles/dashboard/learn.css";
import LetterDetail from "./letterDetail";
import letterDetails from "../data/letterDetails.js";
import sections from "../data/section";
import { useAudio } from "../hooks/useAudio";
import { useProgressTracking } from "../hooks/useProgressTracking";

export default function LearnAlphabet({ currentPage, topicKey }) {
  const itemsPerPage = 14;
  const [alphabet, setAlphabet] = useState([]);
  const [meta, setMeta] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [labels, setLabels] = useState({});
  const [clickedLetters, setClickedLetters] = useState(new Set());
  const { playAudio } = useAudio();
  const { trackProgress } = useProgressTracking();

  // Get the page label from labels.json
  const getPageLabel = (pageIndex) => {
    const pageKey = (pageIndex + 1).toString();
    return labels[pageKey]?.label || `Page ${pageIndex + 1} Letters`;
  };

  useEffect(() => {
    async function loadData() {
      try {
        // 1) Fetch labels if topicKey is provided
        if (topicKey) {
          const sectionConfig = sections.find((s) => s.key === topicKey);
          if (sectionConfig?.labelUrl) {
            try {
              const resLabels = await fetch(sectionConfig.labelUrl);
              if (resLabels.ok) {
                const labelsJson = await resLabels.json();
                setLabels(labelsJson);
              }
            } catch (err) {
              console.warn("Failed to load labels:", err);
            }
          }
        }

        // 2) Use letterDetails directly (audio is filename, will be resolved by useAudio)
        const merged = Object.fromEntries(
          Object.entries(letterDetails).map(([ltr, info]) => {
            // Keep audio as filename - useAudio will resolve to URL based on selected version
            return [ltr, { ...info, audio: info.audio || null }];
          })
        );
        setMeta(merged);

        // 3) slice out the letters for this page
        const pageIndex = Math.max(0, currentPage);
        const start = pageIndex * itemsPerPage;
        const end = start + itemsPerPage;

        const allLetters = Object.keys(merged);
        const slice = allLetters.slice(start, end);

        setAlphabet(
          slice.map((l) => ({
            letter: l,
            phonetic: merged[l].phonetic,
            audio: merged[l].audio, // Filename, not URL
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load letters");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentPage, topicKey]);

  const handleClick = (item) => {
    setSelected((sel) => (sel?.letter === item.letter ? null : item));
    
    // Track clicked letters
    setClickedLetters((prev) => {
      const newSet = new Set(prev);
      newSet.add(item.letter);
      
      // Check if all letters on this page have been clicked
      if (newSet.size === alphabet.length && alphabet.length > 0) {
        // All letters clicked - mark section as completed
        trackProgress(topicKey, "Learn", currentPage + 1, true);
      }
      
      return newSet;
    });
  };

  // Reset clicked letters when page changes
  useEffect(() => {
    setClickedLetters(new Set());
  }, [currentPage, topicKey]);

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="learn-container">
      <h2>{getPageLabel(currentPage)}</h2>

      {selected && meta[selected.letter] && (
        <LetterDetail
          data={{ character: selected.letter, ...meta[selected.letter] }}
          onPlayAudio={playAudio}
        />
      )}

      <div className="learn-grid">
        {alphabet.map((item) => (
          <button
            key={item.letter}
            className={`letter-card ${
              selected?.letter === item.letter ? "active" : ""
            } ${!item.audio ? "no-audio" : ""}`}
            onClick={() => handleClick(item)}
            title={
              item.audio
                ? `Click to hear ${item.phonetic}`
                : "No audio available"
            }
          >
            <span className="letter">{item.letter}</span>
            <span className="phonetic">{item.phonetic}</span>
            {!item.audio && <span className="no-audio-indicator">🔇</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
