import "../styles/reference/reference.css";
import LegendModal from "../components/modal.jsx";
import AlphabetTable from "../components/lettergroup.jsx";
import "../styles/reference/reference.css";
import {useEffect} from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom


export default function Reference() {

  useEffect(() => {
    document.title = "Reference";
  });

  
  return (
    <div className="App">
      <LegendModal />
      <div className="header">
        <h1>Reference</h1>
        <p>
          This page contains the full list of the Amharic alphabet. For better
          practice, click on this{" "}
          <Link to="/reference/flashcard" className="flash">
            Flashcard
          </Link>
          .
        </p>
      </div>
      <AlphabetTable />
    </div>
  );
}
