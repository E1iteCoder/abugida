// src/components/AlphabetTable.jsx
import React, { useState, useEffect } from "react";
import "../styles/reference/group.css";
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

export default function AlphabetTable() {
  const [alphabet, setAlphabet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Build an array of { letter, phonetic, audioLink }
      const parsed = Object.entries(letterDetails).map(([letter, info]) => ({
        letter,
        phonetic: info.phonetic,
        audioLink: audioMap[info.audio] || "",
      }));
      setAlphabet(parsed);
    } catch (err) {
      console.error("Error loading letterDetails:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const playAudio = (src) => {
    if (!src) {
      console.warn("No audio URL for this letter");
      return;
    }
    new Audio(src).play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  };

  if (loading) return <p>Loading alphabet…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="alphabet-wrapper">
      <div className="alphabet-table">
        {alphabet.map((item, idx) => (
          <button
            key={idx}
            className="alphabet-item"
            onClick={() => playAudio(item.audioLink)}
          >
            {item.letter} {item.phonetic}
          </button>
        ))}
      </div>
    </div>
  );
}
