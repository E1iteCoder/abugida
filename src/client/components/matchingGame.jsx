// src/components/matchingGame.jsx
import React, { useEffect, useState, useCallback } from "react";
import letterDetails from "../data/letterDetails.js";
import { useAudio } from "../hooks/useAudio";
import "../styles/dashboard/matchingGame.css";

export default function MatchingGame({ currentPage = 1, topicKey }) {
  const itemsPerPage = 14;
  const { playAudio } = useAudio();
  const [letters, setLetters] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [gameMode, setGameMode] = useState("letter-name"); // letter-name, letter-description
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize game with letters for current page
  useEffect(() => {
    try {
      const allLetters = Object.entries(letterDetails).map(([letter, info]) => ({
        letter,
        name: info.name,
        phonetic: info.phonetic,
        row: info.row,
        column: info.column,
        audio: info.audio,
        description: `it is the ${info.column} variation of the ${info.row}`,
      }));

      // Get letters for current page
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageLetters = allLetters.slice(start, end);

      setLetters(pageLetters);
      setSelectedCards([]);
      setMatchedPairs(new Set());
      setScore(0);
      setMoves(0);
      setGameComplete(false);
    } catch (err) {
      console.error("Failed to load letters:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Create game cards based on game mode
  const createGameCards = useCallback(() => {
    if (letters.length === 0) return { leftCards: [], rightCards: [] };

    const leftCards = letters.map((item, index) => ({
      id: `left-${index}`,
      type: "letter",
      content: item.letter,
      data: item,
    }));

    let rightCards;
    switch (gameMode) {
      case "letter-phonetic":
        rightCards = letters.map((item, index) => ({
          id: `right-${index}`,
          type: "phonetic",
          content: item.phonetic,
          data: item,
        }));
        break;
      case "letter-name":
        rightCards = letters.map((item, index) => ({
          id: `right-${index}`,
          type: "name",
          content: item.name,
          data: item,
        }));
        break;
      case "letter-description":
        rightCards = letters.map((item, index) => ({
          id: `right-${index}`,
          type: "description",
          content: item.description,
          data: item,
        }));
        break;
      default:
        rightCards = [];
    }

    // Shuffle right cards
    const shuffled = [...rightCards].sort(() => Math.random() - 0.5);

    return { leftCards, rightCards: shuffled };
  }, [letters, gameMode]);

  const [gameCards, setGameCards] = useState({ leftCards: [], rightCards: [] });

  useEffect(() => {
    const cards = createGameCards();
    setGameCards(cards);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setScore(0);
    setMoves(0);
    setGameComplete(false);
  }, [createGameCards]);

  const handleCardClick = (card) => {
    // Don't allow clicking already matched or selected cards
    if (matchedPairs.has(card.id) || selectedCards.some((c) => c.id === card.id)) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // If two cards are selected, check for match
    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newSelected;

      // Check if they match (same letter data)
      if (first.data.letter === second.data.letter) {
        // Match found!
        const newMatchedPairs = new Set([...matchedPairs, first.id, second.id]);
        setMatchedPairs(newMatchedPairs);
        setScore((prev) => prev + 10);
        setSelectedCards([]);

        // Play audio for the matched letter
        if (first.data.audio) {
          playAudio(first.data.audio);
        }

        // Check if game is complete
        setTimeout(() => {
          const allMatched = gameCards.leftCards.length * 2 === newMatchedPairs.size;
          if (allMatched) {
            setGameComplete(true);
          }
        }, 300);
      } else {
        // No match, flip cards back after a delay
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    const cards = createGameCards();
    setGameCards(cards);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setScore(0);
    setMoves(0);
    setGameComplete(false);
  };

  const isCardMatched = (cardId) => matchedPairs.has(cardId);
  const isCardSelected = (cardId) => selectedCards.some((c) => c.id === cardId);

  if (loading) return <p>Loading matching game...</p>;
  if (letters.length === 0) return <p>No letters available for this page.</p>;

  return (
    <div className="matching-game-container">
      <div className="game-header">
        <div className="game-controls">
          <label>
            Game Mode:
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="game-mode-select"
            >
              <option value="letter-name">Letter ↔ Name</option>
              <option value="letter-description">Letter ↔ Description</option>
            </select>
          </label>
          <button onClick={resetGame} className="reset-button">
            Reset Game
          </button>
        </div>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Moves: {moves}</span>
          <span>Matched: {matchedPairs.size / 2} / {letters.length}</span>
        </div>
      </div>

      {gameComplete && (
        <div className="game-complete">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You completed the matching game!</p>
          <p>Final Score: {score} | Moves: {moves}</p>
        </div>
      )}

      <div className="matching-game-board">
        <div className="top-row">
          <h3>Letters</h3>
          <div className="cards-row">
            {gameCards.leftCards.map((card) => (
              <button
                key={card.id}
                className={`game-card ${
                  isCardMatched(card.id)
                    ? "matched"
                    : isCardSelected(card.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCardClick(card)}
                disabled={isCardMatched(card.id) || gameComplete}
              >
                {card.content}
              </button>
            ))}
          </div>
        </div>

        <div className="bottom-row">
          <h3>
            {gameMode === "letter-phonetic" && "Phonetics"}
            {gameMode === "letter-name" && "Names"}
            {gameMode === "letter-description" && "Descriptions"}
          </h3>
          <div className="cards-row">
            {gameCards.rightCards.map((card) => (
              <button
                key={card.id}
                className={`game-card ${
                  isCardMatched(card.id)
                    ? "matched"
                    : isCardSelected(card.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCardClick(card)}
                disabled={isCardMatched(card.id) || gameComplete}
              >
                {card.content}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

