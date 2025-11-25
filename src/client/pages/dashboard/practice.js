import FlashcardPractice from "../../components/practiceFlash";
import LetterTracer from "../../components/letterTracer";
import alphabets from "../../data/labels/alphabet.json";

export default function Practice({ currentPage }) {
  return (
    <div className="Main">
      <h3>Flashcard</h3>
      <FlashcardPractice currentPage={currentPage} />
      <h3>Trace The Letter</h3>
      <LetterTracer currentPage={currentPage} />
    </div>
  );
}
