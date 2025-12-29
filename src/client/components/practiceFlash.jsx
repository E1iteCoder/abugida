// src/components/reference/Practice.jsx
import React, { useEffect, useState } from "react";
import Flashcard from "./flashcard"; // same as before
import "../styles/flashcard.css";
import "../styles/dashboard/flashPractice.css";
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";
import { useProgressTracking } from "../hooks/useProgressTracking";

export default function Practice({ currentPage = 1, topicKey }) {
  const itemsPerPage = 14;
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitedCards, setVisitedCards] = useState(new Set());
  const { trackProgress } = useProgressTracking();

  useEffect(() => {
    try {
      // 1) Build the full array from letterDetails + audioMap

      const parsed = Object.entries(letterDetails).map(([letter, info]) => {
        // build your “definition” sentence however you like:
        const defined = `${info.phonetic}: it is the ${info.column} variation of the ${info.row}`;
        return {
          term: letter,
          definition: defined,
          audio: audioMap[info.audio] || "",
        };
      });
      // 2) Slice out only this page’s items
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = parsed.slice(start, end);

      setFlashcards(pageData);
      setCurrentIndex(0);
      setVisitedCards(new Set([0])); // Start with first card visited
    } catch (err) {
      console.error("Failed to load practice flashcards:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const goToNext = () => {
    if (flashcards.length === 0) return;
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setHistory((prev) => [...prev, currentIndex]);
    setCurrentIndex(nextIndex);
    
    // Track visited cards
    setVisitedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentIndex);
      newSet.add(nextIndex);
      
      // If we've visited all cards (complete cycle), mark as completed
      if (newSet.size === flashcards.length && flashcards.length > 0) {
        trackProgress(topicKey, "Practice", currentPage, true);
      }
      
      return newSet;
    });
  };

  const goToPrevious = () => {
    if (history.length > 0) {
      const prevIndex = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIndex(prevIndex);
    }
  };

  if (loading) return <p>Loading practice flashcards...</p>;
  if (!flashcards.length) return <p>No flashcards available.</p>;

  return (
    <div className="flashcard-container">
      <Flashcard {...flashcards[currentIndex]} />

      <div className="slider-controls">
        <button onClick={goToPrevious} disabled={currentIndex === 0}>
          ⬅️
        </button>
        <span>
          {currentIndex + 1} / {itemsPerPage}
        </span>
        <button onClick={goToNext} disabled={currentIndex === itemsPerPage - 1}>
          ➡️
        </button>
      </div>
    </div>
  );
}
