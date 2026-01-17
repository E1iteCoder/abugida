// src/components/QuizCarousel.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/dashboard/quizCarousel.css";

// 1) import your prebuilt JSON data
import letterDetails from "../data/letterDetails.js";
import { useAudio } from "../hooks/useAudio";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

// Time allocated per question (in seconds)
const initialTimePerQuestion = 60;

export default function QuizCarousel({ currentPage = 1, topicKey, section = "Quiz" }) {
  const { isAuthenticated } = useAuth();
  // --- Configuration constants ---
  const itemsPerPage = 14; // 2 houses × 7 letters = 14 letters per page
  const totalQuestions = 21; // 14 questions (one per letter) + 7 randomized = 21 total
  const questionTypes = ["mcq", "typing"];

  // --- State hooks ---
  const [alphabet, setAlphabet] = useState([]); // Section array (14 letters = 2 houses)
  const [allLetters, setAllLetters] = useState([]); // Full alphabet for wrong answers
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [typedInput, setTypedInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTimePerQuestion);
  const [showResults, setShowResults] = useState(false);
  const { playAudio } = useAudio();

  const intervalRef = useRef(null);
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const shuffle = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  // 2) Build & slice your "alphabet" from letterDetails + audioMap
  useEffect(() => {
    try {
      const all = Object.entries(letterDetails).map(([letter, info]) => ({
        id: generateId(),
        letter,
        phonetic: info.phonetic,
        row: info.row, // Store house/row info
        column: info.column, // Store column info for hints
        audio: info.audio || "", // Store filename, not URL - useAudio will resolve
        numeric: info.numeric || null, // Store numeric value for hints
      }));

      // DO NOT dedupe by audio - all letter variations should be included in the quiz
      // Even if letters share the same audio file, they are different letters and should be tested
      // Deduplication for wrong answers in multiple choice is handled in createQuestion function

      // Store full alphabet for getting wrong answers from outside section
      setAllLetters(all);

      // Group by house (row) to ensure we get 2 complete houses per page
      const houses = {};
      const houseOrder = []; // Preserve original order of houses as they appear
      all.forEach((item) => {
        const house = item.row || "unknown";
        if (!houses[house]) {
          houses[house] = [];
          houseOrder.push(house); // Track order of first appearance
        }
        houses[house].push(item);
      });

      // Split houses that have more than 7 letters into chunks of 7
      // This handles cases like "hä-house" which has 21 letters (ሀ-ሆ, ሐ-ሖ, ኀ-ኆ)
      const houseChunks = [];
      const chunkToHouse = []; // Track which house each chunk belongs to
      const lettersPerHouseChunk = 7;
      houseOrder.forEach((house) => {
        const houseLetters = houses[house];
        // If a house has more than 7 letters, split it into multiple groups
        for (let i = 0; i < houseLetters.length; i += lettersPerHouseChunk) {
          houseChunks.push(houseLetters.slice(i, i + lettersPerHouseChunk));
          chunkToHouse.push(house);
        }
      });

      // Interleave chunks: distribute chunks from large houses across quizzes
      // This ensures Quiz 2 gets ሐ-ሖ (second chunk of hä-house)
      // Strategy: take chunks in a round-robin fashion, but group chunks from the same house
      // Quiz 1: first chunk of first house + first complete house
      // Quiz 2: second chunk of first house (if exists) + second complete house
      const housesPerPage = 2;
      const selectedHouses = [];
      
      // Group chunks by their house
      const chunksByHouse = {};
      houseChunks.forEach((chunk, idx) => {
        const house = chunkToHouse[idx];
        if (!chunksByHouse[house]) {
          chunksByHouse[house] = [];
        }
        chunksByHouse[house].push({ chunk, originalIndex: idx });
      });
      
      // Build a flat list interleaving: first chunk of each house, then second chunk, etc.
      const interleavedChunks = [];
      let maxChunks = Math.max(...Object.values(chunksByHouse).map(arr => arr.length));
      
      for (let chunkIndex = 0; chunkIndex < maxChunks; chunkIndex++) {
        houseOrder.forEach((house) => {
          if (chunksByHouse[house] && chunksByHouse[house][chunkIndex]) {
            interleavedChunks.push(chunksByHouse[house][chunkIndex].chunk);
          }
        });
      }
      
      // Select 2 chunks for this page
      const startHouseIndex = (currentPage - 1) * housesPerPage;
      selectedHouses.push(...interleavedChunks.slice(
        startHouseIndex,
        startHouseIndex + housesPerPage
      ));

      // Flatten the selected houses into one array (should be ~14 letters)
      const pageAlphabet = selectedHouses.flat();
      
      // If we have more than 14, take first 14; if less, that's okay too
      setAlphabet(pageAlphabet.slice(0, itemsPerPage));
    } catch (err) {
      setError("Failed to load alphabet data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, shuffle]);

  // 3) Build exactly totalQuestions worth of quiz items
  useEffect(() => {
    if (!alphabet.length || !allLetters.length) return;

    // Get letters from outside the section array (for wrong answers)
    const sectionLetterSet = new Set(alphabet.map(a => a.letter));
    const outsideSection = allLetters.filter(a => !sectionLetterSet.has(a.letter));

    // Helper function to create a question
    const createQuestion = (correct) => {
      // Track used audio IDs to prevent duplicates in the same question
      const usedAudioIds = new Set([correct.audio]);
      
      // Get wrong answers from the section array, excluding those with duplicate audio
      const wrongsFromSection = alphabet.filter(
        (a) => a.audio !== correct.audio && 
               a.letter !== correct.letter &&
               !usedAudioIds.has(a.audio)
      );
      
      // Select 2 wrong answers from section, ensuring no duplicate audio
      const twoWrongFromSection = [];
      for (const item of shuffle(wrongsFromSection)) {
        if (twoWrongFromSection.length >= 2) break;
        if (!usedAudioIds.has(item.audio)) {
          twoWrongFromSection.push(item);
          usedAudioIds.add(item.audio);
        }
      }

      // Get 1 wrong answer from outside the section array
      // Ensure it's not the correct answer and doesn't have duplicate audio
      const wrongsFromOutside = outsideSection.filter(
        (a) => a.letter !== correct.letter && !usedAudioIds.has(a.audio)
      );
      const oneWrongFromOutside = wrongsFromOutside.length > 0
        ? [shuffle(wrongsFromOutside)[0]]
        : []; // Fallback if no outside letters available

      // Combine: correct answer + 2 from section + 1 from outside = 4 total options
      let opts = [correct, ...twoWrongFromSection, ...oneWrongFromOutside];
      
      // If we couldn't get enough options, add more from section (still checking for duplicate audio)
      if (opts.length < 4) {
        const remainingWrongs = wrongsFromSection.filter(
          (a) => !opts.some(o => o.letter === a.letter) && !usedAudioIds.has(a.audio)
        );
        while (opts.length < 4 && remainingWrongs.length > 0) {
          const extraWrong = shuffle(remainingWrongs)[0];
          opts.push(extraWrong);
          usedAudioIds.add(extraWrong.audio);
          // Remove from remainingWrongs to avoid selecting again
          const index = remainingWrongs.findIndex(a => a.letter === extraWrong.letter);
          if (index > -1) remainingWrongs.splice(index, 1);
        }
      }

      return {
        id: generateId(),
        type: questionTypes[
          Math.floor(Math.random() * questionTypes.length)
        ],
        correctAnswer: correct.letter,
        options: shuffle(opts).map((o) => ({
          ...o,
          stableId: generateId(),
        })),
        audio: correct.audio,
        phonetic: correct.phonetic,
        row: correct.row, // Store row for hints
        column: correct.column, // Store column for hints
        numeric: correct.numeric, // Store numeric value for hints
      };
    };

    // Generate questions (one per letter in the set)
    const questionsFromLetters = alphabet.map(createQuestion);

    // Calculate how many extra questions we need to reach totalQuestions (21)
    const extraCount = Math.max(0, totalQuestions - questionsFromLetters.length);
    
    // Generate additional randomized questions from the same set to reach totalQuestions
    const extraQuestions = Array(extraCount)
      .fill()
      .map(() => {
        const randomLetter = shuffle(alphabet)[0];
        return createQuestion(randomLetter);
      });

    // Combine: questions from letters + extra randomized = totalQuestions
    const allQs = [...questionsFromLetters, ...extraQuestions];

    setQuestions(shuffle(allQs));
  }, [alphabet, allLetters, shuffle]);

  // 4) Handler to go to next question or finish
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setShowResults(true);
    }
    setTimeLeft(initialTimePerQuestion);
  }, [currentQuestionIndex, questions.length]);

  // 5) Reset timer on question change or results screen
  useEffect(() => {
    setTimeLeft(initialTimePerQuestion);
  }, [currentQuestionIndex, showResults]);

  // 6) Countdown + auto-skip
  useEffect(() => {
    if (showResults) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          const q = questions[currentQuestionIndex];
          // Only mark as wrong if no answer was recorded AND timer expired
          // Use a function to get the latest answers state to avoid stale closure
          setAnswers((a) => {
            // If answer already exists, don't overwrite it
            if (a[q.id]) {
              return a;
            }
            // Only mark as wrong if truly unanswered
            return {
              ...a,
              [q.id]: { answer: null, isCorrect: false, timestamp: Date.now() },
            };
          });
          handleNextQuestion();
          return initialTimePerQuestion;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [
    questions,
    currentQuestionIndex,
    showResults,
    handleNextQuestion,
  ]);

  // 7) Record an answer
  const handleAnswer = useCallback(
    (qid, ans) => {
      if (answers[qid]) return;
      const correct = questions.find((x) => x.id === qid).correctAnswer === ans;
      setAnswers((a) => ({
        ...a,
        [qid]: { answer: ans, isCorrect: correct, timestamp: Date.now() },
      }));
    },
    [answers, questions]
  );

  // 8) Final results
  const results = {
    score: Object.values(answers).filter((a) => a.isCorrect).length,
    total: questions.length,
    mistakes: questions.filter(
      (q) => !answers[q.id] || !answers[q.id].isCorrect
    ),
    answers: answers, // Include answers in results for display
  };

  // Save progress when quiz is completed
  useEffect(() => {
    if (showResults && isAuthenticated && topicKey && results.total > 0) {
      const accuracy = Math.round((results.score / results.total) * 100);
      
      const saveProgress = async () => {
        try {
          await authAPI.updateProgress(
            topicKey,
            section,
            currentPage,
            true, // completed
            accuracy // score as percentage
          );
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      };

      saveProgress();
    }
  }, [showResults, isAuthenticated, topicKey, section, currentPage, results.score, results.total]);

  // 9) Guards
  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!questions.length) return <div className="loading">Preparing quiz…</div>;

  return (
    <div className="quiz-container">
      {!showResults ? (
        <QuizQuestion
          question={questions[currentQuestionIndex]}
          timeLeft={timeLeft}
          onAnswer={handleAnswer}
          typedInput={typedInput}
          setTypedInput={setTypedInput}
          handleNextQuestion={handleNextQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          playAudio={playAudio}
        />
      ) : (
        <ResultsScreen
          results={results}
          onRetry={() => {
            setAnswers({});
            setCurrentQuestionIndex(0);
            setShowResults(false);
          }}
          playAudio={playAudio}
        />
      )}
    </div>
  );
}

// MCQ & typing question renderer
function QuizQuestion({
  question,
  timeLeft,
  onAnswer,
  typedInput,
  setTypedInput,
  handleNextQuestion,
  questionNumber,
  totalQuestions,
  playAudio,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  if (!question) return null;

  // Format row and column for hint display
  const formatHint = () => {
    if (!question.row || !question.column) return null;
    const rowName = question.row.replace('-house', '').replace('house', '').trim();
    const columnName = question.column.charAt(0).toUpperCase() + question.column.slice(1);
    let hint = `${rowName} house, ${columnName} column`;
    if (question.numeric != null) {
      hint = `Variant #${question.numeric}, ${hint}`;
    }
    return hint;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const answer = typedInput.trim();
    if (!answer) return;
    onAnswer(question.id, answer);
    setTypedInput("");
    handleNextQuestion();
  };

  const handleOptionClick = (letter) => {
    onAnswer(question.id, letter);
    handleNextQuestion();
  };

  const handleSkip = () => {
    // Record skipped question as unanswered
    onAnswer(question.id, null);
    handleNextQuestion();
  };

  return (
    <form
      className="question-block"
      onSubmit={
        question.type === "typing" ? handleSubmit : (e) => e.preventDefault()
      }
    >
      <div
        className="timer-bar"
        style={{
          width: `${(timeLeft / initialTimePerQuestion) * 100}%`,
          backgroundColor: timeLeft <= 5 ? "#ff4444" : "#4caf50",
        }}
      />
      <div className="question-header">
        <h2>
          Question {questionNumber} / {totalQuestions}
        </h2>
        <p>Time Remaining: {timeLeft}s</p>
      </div>
      {/* only show audio button if we have a URL */}
      {question.audio && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <button
            type="button"
            className="audio-button"
            onClick={() => playAudio(question.audio)}
            aria-label="Play Sound"
          >
            🔊 Play Sound
          </button>
          {question.numeric != null && (
            <span className="numeric-hint" style={{ 
              fontSize: '1rem', 
              fontWeight: 'bold', 
              color: '#666',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}>
              Variant #{question.numeric}
            </span>
          )}
        </div>
      )}
      {question.type === "mcq" ? (
        <div className="options-container">
          {question.options.map((opt) => (
            <button
              key={opt.stableId}
              type="button"
              className="option"
              onClick={() => handleOptionClick(opt.letter)}
            >
              {opt.letter}
            </button>
          ))}
        </div>
      ) : (
        <div className="typing-container">
          <input
            autoFocus
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type the letter..."
          />
          {formatHint() && (
            <div className="typing-hint">
              <span className="hint-label">Hint:</span>
              <span className="hint-text">{formatHint()}</span>
            </div>
          )}
        </div>
      )}
      {question.type === "typing" && (
        <div className="navigation-controls">
          <button
            type="submit"
            className="submit-button"
            disabled={!typedInput.trim()}
          >
            Submit Answer
          </button>
          <button
            type="button"
            className="skip-button"
            onClick={handleSkip}
          >
            Skip Question
          </button>
        </div>
      )}
    </form>
  );
}

// Final results screen
function ResultsScreen({ results, onRetry, playAudio }) {
  const { score, total, mistakes } = results;
  const accuracy = Math.round((score / total) * 100);

  let performanceMessage;
  switch (true) {
    case accuracy >= 90:
      performanceMessage = "🎉 Excellent job! You're a natural.";
      break;
    case accuracy >= 70:
      performanceMessage = "👍 Good job! You're on the right track.";
      break;
    case accuracy >= 50:
      performanceMessage = "🤔 You can do better! Keep practicing.";
      break;
    default:
      performanceMessage = "🤨 You need to work on your listening skills.";
      break;
  }
  return (
    <div className="results-screen">
      <h2>Quiz Complete!</h2>
      <div className="score-summary">
        <p>
          Final Score: {score} / {total}
        </p>
        <p>Accuracy: {Math.round((score / total) * 100)}%</p>
        <p className="performance-message">{performanceMessage}</p>
      </div>
      <div className="mistakes-list">
        <h3>Mistakes to Review:</h3>
        {mistakes.map((q) => (
          <div key={q.id} className="mistake-item">
            <p>Sound: {q.phonetic}</p>
            <p>Your answer: {results.answers?.[q.id]?.answer || "None"}</p>
            <p>Correct: {q.correctAnswer}</p>
            {q.audio && (
              <button
                onClick={() => playAudio(q.audio)}
                aria-label="Replay"
              >
                🔊 Replay Sound
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
