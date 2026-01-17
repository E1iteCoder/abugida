import "../styles/reference/reference.css";
import "../styles/reference/referenceCards.css";
import LegendModal from "../components/modal.jsx";
import AlphabetTable from "../components/lettergroup.jsx";
import FlashcardApp from "../components/flashContainer";
import TypeAndRead from "../components/typeAndRead";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Reference() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view"); // Get the view parameter from query string

  useEffect(() => {
    document.title = "Reference";
  });

  // Redirect legacy route /reference/flashcard to query parameter format
  useEffect(() => {
    if (location.pathname === "/reference/flashcard" && !view) {
      navigate("/reference?view=flashcard", { replace: true });
    }
  }, [location.pathname, navigate, view]);

  // Card data
  const referenceCards = [
    {
      id: "alphabet-chart",
      title: "Alphabet Chart",
      description: "Browse the complete Amharic alphabet with audio pronunciation",
      icon: "🔤",
    },
    {
      id: "flashcard",
      title: "Flashcard",
      description: "Practice with interactive flashcards to memorize letters",
      icon: "🎴",
    },
    {
      id: "type-and-read",
      title: "Type and Read",
      description: "Type any Amharic text and hear each letter pronounced",
      icon: "⌨️",
    },
  ];

  // Handle card click
  const handleCardClick = (cardId) => {
    navigate(`/reference?view=${cardId}`);
  };

  // Handle back button
  const handleBack = () => {
    navigate("/reference");
  };

  // Render the appropriate component based on view
  const renderView = () => {
    switch (view) {
      case "alphabet-chart":
        return <AlphabetTable />;
      case "flashcard":
        return <FlashcardApp />;
      case "type-and-read":
        return <TypeAndRead />;
      default:
        return null;
    }
  };

  // If a view is selected, show that component with a back button
  if (view) {
    return (
      <div className="App">
        <LegendModal />
        <div className="reference-view-container">
          <button onClick={handleBack} className="reference-back-btn">
            ← Back to Reference
          </button>
          <div className="reference-view-content">{renderView()}</div>
        </div>
      </div>
    );
  }

  // Otherwise show the card selection interface
  return (
    <div className="App">
      <LegendModal />
      <div className="reference-header">
        <h1>Reference</h1>
        <p>
          Choose a reference tool to explore the Amharic alphabet and practice
          your skills.
        </p>
      </div>
      <div className="reference-cards-container">
        {referenceCards.map((card) => (
          <div
            key={card.id}
            className="reference-card"
            onClick={() => handleCardClick(card.id)}
          >
            <div className="reference-card-icon">{card.icon}</div>
            <h3 className="reference-card-title">{card.title}</h3>
            <p className="reference-card-description">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
