// src/components/Flashcard.jsx
import React, { useState, useEffect } from "react";
import "../styles/flashcard.css";

export default function Flashcard({ term, definition, audio, frontSide = "term", backSide = "definition" }) {
  const [flipped, setFlipped] = useState(false);

  // Reset flipped state when card changes (term or definition changes)
  useEffect(() => {
    setFlipped(false);
  }, [term, definition]);

  // Determine what to show on front and back based on settings
  const frontContent = frontSide === "term" ? term : definition;
  const backContent = backSide === "term" ? term : definition;

  // Format definition with better spacing if it contains multiple parts
  const formatContent = (content) => {
    if (typeof content === "string" && content.includes(" ")) {
      // Split by spaces and add extra spacing between major parts
      const parts = content.split(/\s+/);
      return parts.join("  "); // Double space for better separation
    }
    return content;
  };

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

  // Determine which side shows the definition (for audio button placement)
  const frontIsDefinition = frontSide === "definition";
  const backIsDefinition = backSide === "definition";

  // Determine content type for styling
  const frontIsTerm = frontSide === "term";
  const backIsTerm = backSide === "term";

  return (
    <div className={`flashcard ${flipped ? "flipped" : ""}`}>
      <div className="flashcard-inner">
        {/* FRONT FACE */}
        <div className="flashcard-front" onClick={handleFlip}>
          <p className={frontIsTerm ? "flashcard-term" : "flashcard-definition"}>
            {formatContent(frontContent)}
          </p>
          {frontIsDefinition && audio && (
            <button className="audio-btn" onClick={handleAudio}>
              🔊
            </button>
          )}
        </div>

        {/* BACK FACE */}
        <div className="flashcard-back" onClick={handleFlip}>
          <p className={backIsTerm ? "flashcard-term" : "flashcard-definition"}>
            {formatContent(backContent)}
          </p>
          {backIsDefinition && audio && (
            <button className="audio-btn" onClick={handleAudio}>
              🔊
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
