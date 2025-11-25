import QuizCarousel from "../../components/quiz";

export default function Quiz({ currentPage, topicKey }) {
  return (
    <div className="Main">
      <div className="quizContainer">
        <QuizCarousel currentPage={currentPage} />
      </div>
    </div>
  );
}
