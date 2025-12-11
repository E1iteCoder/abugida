// src/components/QuizCarousel.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import "../styles/dashboard/quizCarousel.css";

// 1) import your prebuilt JSON data
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

// Time allocated per question (in seconds)
const initialTimePerQuestion = 60;

export default function QuizCarousel({ currentPage = 1 }) {
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
        audio: audioMap[info.audio] || "" /* guard missing key */,
      }));

      // dedupe by audio URL
      const seen = new Set();
      const unique = all.filter((item) => {
        if (!item.audio || seen.has(item.audio)) return false;
        seen.add(item.audio);
        return true;
      });

      // Store full alphabet for getting wrong answers from outside section
      setAllLetters(unique);

      // Group by house (row) to ensure we get 2 complete houses per page
      const houses = {};
      const houseOrder = []; // Preserve original order of houses as they appear
      unique.forEach((item) => {
        const house = item.row || "unknown";
        if (!houses[house]) {
          houses[house] = [];
          houseOrder.push(house); // Track order of first appearance
        }
        houses[house].push(item);
      });

      // Get all houses as arrays, preserving original order (not sorted alphabetically)
      const houseArrays = houseOrder.map(house => houses[house]);

      // Calculate which 2 houses to use for this page
      // currentPage 1 = first 2 houses (index 0-1)
      // currentPage 2 = next 2 houses (index 2-3), etc.
      const housesPerPage = 2;
      const startHouseIndex = (currentPage - 1) * housesPerPage;
      const selectedHouses = houseArrays.slice(
        startHouseIndex,
        startHouseIndex + housesPerPage
      );

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
      // Get 2 wrong answers from the section array
      const wrongsFromSection = alphabet.filter(
        (a) => a.audio !== correct.audio && a.letter !== correct.letter
      );
      const twoWrongFromSection = shuffle(wrongsFromSection).slice(0, 2);

      // Get 1 wrong answer from outside the section array (and ensure it's not the correct answer)
      const wrongsFromOutside = outsideSection.filter(
        (a) => a.letter !== correct.letter
      );
      const oneWrongFromOutside = wrongsFromOutside.length > 0
        ? [shuffle(wrongsFromOutside)[0]]
        : []; // Fallback if no outside letters available

      // Combine: correct answer + 2 from section + 1 from outside = 4 total options
      const opts = [correct, ...twoWrongFromSection, ...oneWrongFromOutside];
      
      // If we couldn't get an outside letter, add one more from section
      if (opts.length < 4) {
        const extraWrong = wrongsFromSection.find(
          (a) => !opts.some(o => o.letter === a.letter)
        );
        if (extraWrong) opts.push(extraWrong);
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
      };
    };

    // Generate 14 questions (one per letter in the set)
    const questionsFromLetters = alphabet.map(createQuestion);

    // Generate 7 additional randomized questions from the same set
    const extraQuestions = Array(7)
      .fill()
      .map(() => {
        const randomLetter = shuffle(alphabet)[0];
        return createQuestion(randomLetter);
      });

    // Combine: 14 questions + 7 randomized = 21 total questions
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
          if (q && !answers[q.id]) {
            setAnswers((a) => ({
              ...a,
              [q.id]: { answer: null, isCorrect: false, timestamp: Date.now() },
            }));
          }
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
    answers,
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
      (q) => answers[q.id] && !answers[q.id].isCorrect
    ),
  };

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
        />
      ) : (
        <ResultsScreen
          results={results}
          onRetry={() => {
            setAnswers({});
            setCurrentQuestionIndex(0);
            setShowResults(false);
          }}
        />
      )}
    </div>
  );
}

// MCQ & typing question renderer (unchanged)
function QuizQuestion({
  question,
  timeLeft,
  onAnswer,
  typedInput,
  setTypedInput,
  handleNextQuestion,
  questionNumber,
  totalQuestions,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  if (!question) return null;

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
        <button
          type="button"
          className="audio-button"
          onClick={() => new Audio(question.audio).play().catch(() => {})}
          aria-label="Play Sound"
        >
          🔊 Play Sound
        </button>
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
            onClick={handleNextQuestion}
          >
            Skip Question
          </button>
        </div>
      )}
    </form>
  );
}

// Final results screen (unchanged)
function ResultsScreen({ results, onRetry }) {
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
                onClick={() => new Audio(q.audio).play()}
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
