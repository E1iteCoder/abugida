// src/components/reference/FlashcardContainer.jsx
import React, { useState, useEffect } from "react";
import Flashcard from "./flashcard";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/reference/flashContainer.css";

// instead of fetching at runtime, import the JSON directly:
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

export default function FlashcardContainer() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // 1) Build your flashcard array from letterDetails + audioMap
      const parsed = Object.entries(letterDetails).map(([term, info]) => ({
        term,
        // use phonetic (or whichever field you want as "definition")
        definition: info.phonetic + info.row + info.column || "",
        // look up the real URL; default to empty string if missing
        audio: audioMap[info.audio] || "",
      }));

      setFlashcards(parsed);

      // 2) Pick an initial random index
      setCurrentCardIndex(Math.floor(Math.random() * parsed.length));
    } catch (err) {
      console.error(err);
      setError("Failed to load flashcards from JSON");
    } finally {
      setLoading(false);
    }
  }, []); // no fetch calls any more

  if (loading) return <p>Loading flashcards...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!flashcards.length) return <p>No flashcards available.</p>;

  const goToNext = () => {
    // exactly your original logic
    if (flashcards.length === 0) return;
    const newIndex = Math.floor(Math.random() * flashcards.length);
    setHistory((prev) => [...prev, currentCardIndex]);
    setCurrentCardIndex(newIndex);
  };

  const goToPrevious = () => {
    if (history.length > 0) {
      const lastIndex = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentCardIndex(lastIndex);
    }
  };

  return (
    <div className="flashcard-container">
      <Flashcard {...flashcards[currentCardIndex]} />

      <div className="slider-controls">
        <button onClick={goToPrevious} disabled={history.length === 0}>
          ←
        </button>
        <span>Reference</span>
        <button onClick={goToNext}>→</button>
      </div>
    </div>
  );
}
