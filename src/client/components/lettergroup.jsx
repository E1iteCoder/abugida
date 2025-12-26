// src/components/AlphabetTable.jsx
import React, { useState, useEffect } from "react";
import "../styles/reference/group.css";
import letterDetails from "../data/letterDetails.js";
import { useAudio } from "../hooks/useAudio";

export default function AlphabetTable() {
  const [alphabet, setAlphabet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playAudio } = useAudio();

  useEffect(() => {
    try {
      // Build an array of { letter, phonetic, audioFilename }
      // Pass filename to playAudio, which will resolve to URL based on selected version
      const parsed = Object.entries(letterDetails).map(([letter, info]) => ({
        letter,
        phonetic: info.phonetic,
        audioFilename: info.audio || "", // Store filename, not URL
      }));
      setAlphabet(parsed);
    } catch (err) {
      console.error("Error loading letterDetails:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading alphabet…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="alphabet-wrapper">
      <div className="alphabet-table">
        {alphabet.map((item, idx) => (
          <button
            key={idx}
            className="alphabet-item"
            onClick={() => playAudio(item.audioFilename)} // Pass filename, useAudio resolves to URL
          >
            {item.letter} {item.phonetic}
          </button>
        ))}
      </div>
    </div>
  );
}
