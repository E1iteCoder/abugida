// src/components/reference/FlashcardContainer.jsx
import React, { useState, useEffect } from "react";
import Flashcard from "./flashcard";
import FlashcardSettingsModal from "./flashcardSettingsModal";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import "../styles/reference/flashContainer.css";
import "../styles/reference/modal.css";

// instead of fetching at runtime, import the JSON directly:
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function FlashcardContainer() {
  const [flashcards, setFlashcards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]); // Cards in current order
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem("flashcardSettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { frontSide: "term", backSide: "definition", order: "randomized" };
      }
    }
    return { frontSide: "term", backSide: "definition", order: "randomized" };
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Load flashcards data
  useEffect(() => {
    try {
      // 1) Build your flashcard array from letterDetails + audioMap
      const parsed = Object.entries(letterDetails).map(([term, info]) => ({
        term,
        // use phonetic (or whichever field you want as "definition")
        // Add proper spacing between phonetic, row, and column
        definition: `${info.phonetic || ""} ${info.row || ""} ${info.column || ""}`.trim(),
        // look up the real URL; default to empty string if missing
        audio: audioMap[info.audio] || "",
      }));

      setFlashcards(parsed);
    } catch (err) {
      console.error(err);
      setError("Failed to load flashcards from JSON");
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply order settings when flashcards or settings change
  useEffect(() => {
    if (flashcards.length === 0) return;

    let orderedCards;
    if (settings.order === "randomized") {
      orderedCards = shuffleArray(flashcards);
    } else {
      orderedCards = [...flashcards]; // Linear order
    }

    setDisplayedCards(orderedCards);
    setCurrentCardIndex(0);
    setHistory([]);
  }, [flashcards, settings.order]);

  // Show settings modal on first load if no settings saved
  useEffect(() => {
    const hasSeenSettings = localStorage.getItem("flashcardSettingsSeen");
    if (!hasSeenSettings && !loading) {
      setShowSettings(true);
    }
  }, [loading]);

  const handleSaveSettings = (newSettings) => {
    // Validate that front and back are different
    if (newSettings.frontSide === newSettings.backSide) {
      return; // Don't save invalid settings
    }

    setSettings(newSettings);
    localStorage.setItem("flashcardSettings", JSON.stringify(newSettings));
    localStorage.setItem("flashcardSettingsSeen", "true");
  };

  const goToNext = () => {
    if (displayedCards.length === 0) return;
    
    if (settings.order === "randomized") {
      // Random next card
      const newIndex = Math.floor(Math.random() * displayedCards.length);
      setHistory((prev) => [...prev, currentCardIndex]);
      setCurrentCardIndex(newIndex);
    } else {
      // Linear next card
      const newIndex = (currentCardIndex + 1) % displayedCards.length;
      setHistory((prev) => [...prev, currentCardIndex]);
      setCurrentCardIndex(newIndex);
    }
  };

  const goToPrevious = () => {
    if (history.length > 0) {
      const lastIndex = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentCardIndex(lastIndex);
    }
  };

  if (loading) return <p>Loading flashcards...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!displayedCards.length) return <p>No flashcards available.</p>;

  const currentCard = displayedCards[currentCardIndex];

  return (
    <div className="flashcard-page">
      <div className="flashcard-header">
        <h1>Flashcards</h1>
        <p>Practice more with the flashcards! <br />
          If you'd like to change the settings of the flashcards, <br />
          click the cog icon to change the settings for the flashcards.</p>
      </div>
      <div className="flashcard-wrapper">
        <FlashcardSettingsModal
          show={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />

        <button
          onClick={() => setShowSettings(true)}
          className="custom-button open"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>

        <div className="flashcard-container">
          <Flashcard
            key={`${currentCard.term}-${currentCardIndex}`}
            {...currentCard}
            frontSide={settings.frontSide}
            backSide={settings.backSide}
          />

          <div className="slider-controls">
            <button onClick={goToPrevious} disabled={history.length === 0}>
              ←
            </button>
            <span>
              {currentCardIndex + 1} / {displayedCards.length}
            </span>
            <button onClick={goToNext}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
