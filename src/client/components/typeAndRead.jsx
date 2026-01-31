// src/components/typeAndRead.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import "../styles/dashboard/typeAndRead.css";
import letterDetails from "../data/letterDetails.js";
import { useGetAudio } from "../utils/getAudio";

export default function TypeAndRead() {
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  const [parsedLetters, setParsedLetters] = useState([]);
  const stopSequenceRef = useRef(null);
  const getAudio = useGetAudio();

  // Check if a character is an Amharic letter (Unicode range U+1200 to U+137F)
  const isAmharicChar = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x1200 && code <= 0x137f;
  };

  // Parse input text into letters with their positions and audio info
  const parseText = useCallback((text) => {
    const letters = [];
    let position = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (isAmharicChar(char)) {
        const detail = letterDetails[char];
        if (detail && detail.audio) {
          const audioUrl = getAudio(detail.audio);
          if (audioUrl) {
            letters.push({
              char,
              position: i,
              audioUrl,
              hasAudio: true,
            });
          } else {
            // Character exists in letterDetails but no audio URL found
            letters.push({
              char,
              position: i,
              audioUrl: null,
              hasAudio: false,
            });
          }
        } else {
          // Character is Amharic but not in letterDetails
          letters.push({
            char,
            position: i,
            audioUrl: null,
            hasAudio: false,
          });
        }
      } else if (char === " " || char === "\n" || char === "\t") {
        // Space or whitespace - add pause marker
        letters.push({
          char: " ",
          position: i,
          audioUrl: null,
          hasAudio: false,
          isSpace: true,
        });
      }
      // Skip other non-Amharic characters (punctuation, numbers, etc.)
    }

    return letters;
  }, [getAudio]);

  // Handle play button click
  const handlePlay = useCallback(() => {
    if (!inputText.trim()) {
      return;
    }

    const letters = parseText(inputText);
    const validLetters = letters.filter((l) => l.hasAudio);

    if (validLetters.length === 0) {
      console.warn("No valid Amharic letters with audio found in input");
      return;
    }

    // Build audio URLs array with pauses for spaces
    const audioUrls = [];
    const letterIndices = []; // Track which letter index corresponds to each audio URL

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      if (letter.isSpace) {
        // Add null to indicate pause (will be handled by gap)
        audioUrls.push(null);
        letterIndices.push(-1); // -1 indicates space
      } else if (letter.hasAudio) {
        audioUrls.push(letter.audioUrl);
        letterIndices.push(i);
      }
    }

    // Filter out nulls but keep track of spaces for longer pauses
    const filteredUrls = [];
    const filteredIndices = [];
    let lastWasSpace = false;

    for (let i = 0; i < audioUrls.length; i++) {
      if (audioUrls[i] === null) {
        lastWasSpace = true;
      } else {
        if (lastWasSpace) {
          // Add a marker for longer pause before this audio
          filteredUrls.push("PAUSE");
          filteredIndices.push(-1);
          lastWasSpace = false;
        }
        filteredUrls.push(audioUrls[i]);
        filteredIndices.push(letterIndices[i]);
      }
    }

    setIsPlaying(true);
    setCurrentLetterIndex(-1);
    setParsedLetters(letters);

    // Custom play function that handles pauses
    let currentIdx = 0;
    let currentAudio = null;
    let isStopped = false;

    const playNext = () => {
      if (isStopped || currentIdx >= filteredUrls.length) {
        setIsPlaying(false);
        setCurrentLetterIndex(-1);
        if (stopSequenceRef.current) {
          stopSequenceRef.current = null;
        }
        return;
      }

      const url = filteredUrls[currentIdx];
      const letterIdx = filteredIndices[currentIdx];

      if (url === "PAUSE") {
        // Longer pause for spaces (1000ms)
        setTimeout(() => {
          if (!isStopped) {
            currentIdx++;
            playNext();
          }
        }, 500);
        return;
      }

      setCurrentLetterIndex(letterIdx);

      currentAudio = new Audio(url);
      currentAudio.play().catch((error) => {
        console.error(`Audio playback failed for letter ${currentIdx}:`, error);
        // Continue to next letter
        currentIdx++;
        setTimeout(playNext, 200);
      });

      currentAudio.onended = () => {
        currentIdx++;
        setTimeout(playNext, 200); // 600ms gap between letters
      };
    };

    // Store stop function
    stopSequenceRef.current = () => {
      isStopped = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentLetterIndex(-1);
    };

    playNext();
  }, [inputText, parseText]);

  // Handle stop button click
  const handleStop = useCallback(() => {
    if (stopSequenceRef.current) {
      stopSequenceRef.current();
      stopSequenceRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopSequenceRef.current) {
        stopSequenceRef.current();
      }
    };
  }, []);

  const letters = parseText(inputText);
  const hasValidLetters = letters.some((l) => l.hasAudio);

  return (
    <div className="type-and-read-container">
      <div className="type-and-read-input-section">
        <label htmlFor="amharic-input" className="type-and-read-label">
          Type Amharic Letters:
        </label>
        <textarea
          id="amharic-input"
          className="type-and-read-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type Amharic letters here (e.g., አቡጊዳ)"
          rows={4}
          disabled={isPlaying}
        />
        <div className="type-and-read-controls">
          <button
            className="type-and-read-play-btn button"
            onClick={handlePlay}
            disabled={isPlaying || !hasValidLetters}
          >
            {isPlaying ? "Playing..." : "🔊 Play Audio"}
          </button>
          {isPlaying && (
            <button
              className="type-and-read-stop-btn button"
              onClick={handleStop}
            >
              ⏹️ Stop
            </button>
          )}
        </div>
        {!hasValidLetters && inputText.trim() && (
          <p className="type-and-read-warning">
            No valid Amharic letters with audio found. Please type Amharic characters.
          </p>
        )}
      </div>

      {letters.length > 0 && (
        <div className="type-and-read-display">
          <h4>Letters to be played:</h4>
          <div className="type-and-read-letters">
            {letters.map((letter, idx) => {
              const isCurrent = idx === currentLetterIndex;
              const className = `type-and-read-letter ${
                isCurrent ? "type-and-read-letter-current" : ""
              } ${!letter.hasAudio && !letter.isSpace ? "type-and-read-letter-no-audio" : ""} ${
                letter.isSpace ? "type-and-read-letter-space" : ""
              }`;

              return (
                <span key={idx} className={className}>
                  {letter.isSpace ? " " : letter.char}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
