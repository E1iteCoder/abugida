import FlashcardPractice from "../../components/practiceFlash";
import LetterTracer from "../../components/letterTracer";
import { useState, useEffect } from 'react';

export default function Practice({ currentPage }) {
  const [alphabets, setAlphabets] = useState({});

  useEffect(() => {
    fetch('/labels/alphabet.json')  // Note: /labels/ not ./labels/
      .then(res => res.json())
      .then(setAlphabets)
      .catch(console.error);
  }, []);

  return (
    <div className="Main">
      <h3>Flashcard</h3>
      <FlashcardPractice currentPage={currentPage} alphabets={alphabets} />
      <h3>Trace The Letter</h3>
      <LetterTracer currentPage={currentPage} alphabets={alphabets} />
    </div>
  );
}
