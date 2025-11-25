// src/components/Flashcard.jsx
import React, { useState } from "react";
import "../styles/flashcard.css";

export default function Flashcard({ term, definition, audio }) {
  const [flipped, setFlipped] = useState(false);

  // toggles flipped state
  const handleFlip = (e) => {
    e.stopPropagation();
    setFlipped((f) => !f);
  };

  // plays audio without flipping
  const handleAudio = (e) => {
    e.stopPropagation();
    if (audio) new Audio(audio).play();
  };

  return (
    <div className={`flashcard ${flipped ? "flipped" : ""}`}>
      <div className="flashcard-inner">
        {/* FRONT FACE */}
        <div className="flashcard-front" onClick={handleFlip}>
          <p>{term}</p>
        </div>

        {/* BACK FACE */}
        <div className="flashcard-back" onClick={handleFlip}>
          <p>{definition}</p>
          <button className="audio-btn" onClick={handleAudio}>
            🔊
          </button>
        </div>
      </div>
    </div>
  );
}
