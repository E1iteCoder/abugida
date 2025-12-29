import QuizCarousel from "../../components/quiz";
import { useLocation } from "react-router-dom";

export default function Quiz({ currentPage, topicKey }) {
  const params = new URLSearchParams(useLocation().search);
  const section = params.get("section") || "Quiz";
  
  return (
    <div className="Main">
      <div className="quizContainer">
        <QuizCarousel 
          currentPage={currentPage} 
          topicKey={topicKey}
          section={section}
        />
      </div>
    </div>
  );
}
