// src/components/LetterDetail.jsx
import React, { useState } from "react";
import "../styles/dashboard/learn.css";
import letterDetails from "../data/letterDetails.js";
import { useAudio } from "../hooks/useAudio";
import { playAudioSequence } from "../utils/audioSequence";

export default function LetterDetail({ data }) {
  const {
    character,
    name,
    phonetic,
    row,
    column,
    audio,
    strokeGif,
    examples = [],
    numeric,
    usageNotes = [],
  } = data;

  const { playAudio } = useAudio();

  // Get audio file for a specific character
  const getAudioForChar = (char) => {
    const detail = letterDetails[char];
    return detail ? detail.audio : null;
  };

  // Play breakdown audio sequence with intervals
  const playBreakdownAudio = (example, gapMs = 600) => {
    const clips = example.breakdown
      .map(char => getAudioForChar(char))
      .filter(audio => audio); // Remove nulls

    return playAudioSequence(clips, { gapMs });
  };

  return (
    <div className="letter-detail">
      <h3 className="ld-heading">Letter: {character}</h3>

      <p className="ld-field">
        <strong>Name:</strong> {name} <em>({phonetic})</em>
      </p>

      <p className="ld-audio">
        <strong>Play Audio:</strong>
        {audio && (
          <button
            className="ld-play-btn button"
            onClick={() => playAudio(audio)}
          >
            🔊 Play Pronunciation
          </button>
        )}
      </p>

      <h3 className="ld-subheading">Placement in the Script</h3>
      <p className="ld-sentence">
        This character belongs to the <strong>{row}</strong> and it is the{" "}
        <strong>{column}</strong> variation.
      </p>

      <h3 className="ld-subheading">How to Draw {character}</h3>
      {strokeGif ? (
        <img
          className="ld-gif"
          src={strokeGif}
          alt={`Stroke order of ${character}`}
        />
      ) : (
        <p className="ld-note">No stroke-order GIF available.</p>
      )}

      <h3 className="ld-subheading">Examples</h3>
      {examples.length > 0 ? (
        examples.map((ex, exIdx) => (
          <div key={`${ex.word}-${exIdx}`} className="ld-example">
            <p>
              <strong>Word:</strong> {ex.word} — "{ex.gloss}"
            </p>
            <p>
              <strong>Breakdown:</strong> {ex.breakdown.join(" + ")}
            </p>
            {ex.breakdown.length > 0 && (
              <button
                className="ld-play-btn button"
                onClick={() => playBreakdownAudio(ex)}
                disabled={true}
                style={{ marginTop: '0.5rem' }}
              >
                🔊 Play breakdown audio
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="ld-note">No examples provided.</p>
      )}

      {(numeric != null || usageNotes.length > 0) && (
        <>
          <h3 className="ld-subheading">Other Info</h3>
          <ul className="ld-list">
            {numeric != null && (
              <li>
                <strong>Numeric Value:</strong> {numeric}
              </li>
            )}
            {usageNotes.length > 0 && (
              <li>
                <strong>Usage Notes:</strong> {usageNotes.join("; ")}
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
