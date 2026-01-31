// src/components/typeAndRead.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import "../styles/dashboard/typeAndRead.css";
import letterDetails, { nameToAmharicChar } from "../data/letterDetails.js";
import { useGetAudio } from "../utils/getAudio";

// Transliteration tokens (letter names) sorted by length descending for longest-match tokenization.
// Enables run-together input like "hahuhi" → ha + hu + hi without spaces.
const transliterationTokens = Object.keys(nameToAmharicChar).sort(
  (a, b) => b.length - a.length
);

const PLAYBACK_SPEED_KEY = "typeAndReadPlaybackSpeed";
const MIN_SPEED = 0.1;
const MAX_SPEED = 2;
const DEFAULT_SPEED = 1;

function getStoredPlaybackSpeed() {
  try {
    const stored = localStorage.getItem(PLAYBACK_SPEED_KEY);
    if (stored == null) return DEFAULT_SPEED;
    const n = parseFloat(stored, 10);
    if (Number.isNaN(n)) return DEFAULT_SPEED;
    return Math.max(MIN_SPEED, Math.min(MAX_SPEED, n));
  } catch {
    return DEFAULT_SPEED;
  }
}

export default function TypeAndRead() {
  const [inputText, setInputText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  const [parsedLetters, setParsedLetters] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(getStoredPlaybackSpeed);
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);
  const stopSequenceRef = useRef(null);
  const getAudio = useGetAudio();

  const handleSpeedChange = useCallback((e) => {
    const value = parseFloat(e.target.value, 10);
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, value));
    setPlaybackSpeed(clamped);
    try {
      localStorage.setItem(PLAYBACK_SPEED_KEY, String(clamped));
    } catch (_) {}
  }, []);

  // Check if a character is an Amharic letter (Unicode range U+1200 to U+137F)
  const isAmharicChar = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x1200 && code <= 0x137f;
  };

  // Parse input text into letters with their positions and audio info.
  // Supports Amharic characters and English transliteration (with or without spaces).
  // Transliteration uses longest-match: "hahuhi" → ha + hu + hi by matching letter names.
  const parseText = useCallback((text) => {
    const letters = [];

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
            letters.push({
              char,
              position: i,
              audioUrl: null,
              hasAudio: false,
            });
          }
        } else {
          letters.push({
            char,
            position: i,
            audioUrl: null,
            hasAudio: false,
          });
        }
      } else if (char === " " || char === "\n" || char === "\t") {
        letters.push({
          char: " ",
          position: i,
          audioUrl: null,
          hasAudio: false,
          isSpace: true,
        });
      } else {
        // Transliteration: longest-match against known letter names (no spaces required)
        let matched = false;
        for (const token of transliterationTokens) {
          const slice = text.slice(i, i + token.length);
          if (slice.length === token.length && slice.toLowerCase() === token.toLowerCase()) {
            const amharicChar = nameToAmharicChar[token];
            const detail = letterDetails[amharicChar];
            const audioUrl = detail && detail.audio ? getAudio(detail.audio) : null;
            letters.push({
              char: amharicChar,
              position: i,
              audioUrl,
              hasAudio: !!audioUrl,
            });
            i += token.length - 1; // advance; for-loop will i++
            matched = true;
            break;
          }
        }
        if (!matched) {
          letters.push({
            char: text[i],
            position: i,
            audioUrl: null,
            hasAudio: false,
          });
        }
      }
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
      currentAudio.playbackRate = playbackSpeed;
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
  }, [inputText, parseText, playbackSpeed]);

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
          Type Amharic or English transliteration:
        </label>
        <textarea
          id="amharic-input"
          className="type-and-read-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Amharic (e.g., አቡጊዳ) or transliteration with or without spaces (e.g., ha hu hi or hahuhi)"
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
          <div className="type-and-read-speed-wrap">
            <button
              type="button"
              className="type-and-read-speed-btn button"
              onClick={() => setShowSpeedSlider((s) => !s)}
              aria-label="Playback speed"
              title="Playback speed"
            >
              ⏱ {playbackSpeed}x
            </button>
            {showSpeedSlider && (
              <div className="type-and-read-speed-slider-wrap">
                <span className="type-and-read-speed-label">0.1x</span>
                <input
                  type="range"
                  className="type-and-read-speed-slider"
                  min={MIN_SPEED}
                  max={MAX_SPEED}
                  step={0.1}
                  value={playbackSpeed}
                  onChange={handleSpeedChange}
                  aria-label="Playback speed 0.1x to 2x"
                />
                <span className="type-and-read-speed-label">2x</span>
                <span className="type-and-read-speed-value">{playbackSpeed}x</span>
              </div>
            )}
          </div>
        </div>
        {!hasValidLetters && inputText.trim() && (
          <p className="type-and-read-warning">
            No valid letters with audio found. Type Amharic or transliteration (e.g., hahuhi or ha hu hi).
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
