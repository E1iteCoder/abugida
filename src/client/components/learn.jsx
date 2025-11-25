// src/pages/dashboard/learn.jsx
import React, { useState, useEffect } from "react";
import "../styles/dashboard/learn.css";
import LetterDetail from "./letterDetail";
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

export default function LearnAlphabet({ currentPage }) {
  const itemsPerPage = 14;
  const [alphabet, setAlphabet] = useState([]);
  const [meta, setMeta] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio playback function
  const playAudio = (audioUrl) => {
    if (!audioUrl) {
      console.warn("No audio URL provided");
      return;
    }

    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  };

  // Get the page label from alphabets.json
  const getPageLabel = (pageIndex) => {
    const pageKey = (pageIndex + 1).toString();
    return alphabets[pageKey]?.label || `Page ${pageIndex + 1} Letters`;
  };

  useEffect(() => {
    try {
      // 1) merge your metadata + audioMap
      const merged = Object.fromEntries(
        Object.entries(letterDetails).map(([ltr, info]) => {
          const audioUrl = audioMap[info.audio];
          if (!audioUrl && info.audio) {
            console.warn(`No audio found for ${ltr} (${info.audio})`);
          }
          return [ltr, { ...info, audio: audioUrl || null }];
        })
      );
      setMeta(merged);

      // Debug: Check first few mappings
      console.log("First few letters with audio URLs:");
      Object.entries(merged)
        .slice(0, 5)
        .forEach(([letter, data]) => {
          console.log(`${letter}: ${data.audio || "NO AUDIO"}`);
        });

      // 2) slice out the letters for this page
      const pageIndex = Math.max(0, currentPage);
      const start = pageIndex * itemsPerPage;
      const end = start + itemsPerPage;

      const allLetters = Object.keys(merged);
      const slice = allLetters.slice(start, end);

      console.log({ currentPage, start, end, slice });
      setAlphabet(
        slice.map((l) => ({
          letter: l,
          phonetic: merged[l].phonetic,
          audio: merged[l].audio,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load letters");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const handleClick = (item) => {
    setSelected((sel) => (sel?.letter === item.letter ? null : item));
    // Audio will only play when "Play Pronunciation" button is clicked
  };

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
