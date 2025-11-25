import { useState } from "react";
import "../styles/reference/modal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";

function LegendModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button className="custom-button open" onClick={handleShow}>
        <FontAwesomeIcon icon={faQuestion} />
      </button>

      {show && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Legend</h2>
              <button className="close-button" onClick={handleClose}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                When you read this Amharic alphabet chart, it must have been
                confusing with the phonetics of the <b>ፊደሎች(fídèloch:</b>
                letters). This key will help you identify how this chart
                functions.
              </p>
              <ul>
                <li>
                  <b>è:</b> This phonetic is found in some of the first letters
                  in the family (row). It sounds like: the "a" in about, the "e"
                  in the, the "u" in shut.
                </li>
                <li>
                  <b>u:</b> This phonetic is found in the 2nd letter of each
                  family (row). It sounds like: the "oo" in boot, "oe" in shoe,
                  "oo" in cool, "u" in dude.
                </li>
                <li>
                  <b>í:</b> This phonetic is found in the 3rd letter of each
                  family (row). It sounds like: the "ea" in tea & seat, the "ee"
                  in teeth & sheet, the "e" in he & she.
                </li>
                <li>
                  <b>ä:</b> This phonetic is found in the 4th letter of each
                  family (row) and some of the 1st letters in each row. It
                  sounds like: the "o" in top & cop, the "a" in apple & at, and
                  more.
                </li>
                <li>
                  <b>ê:</b> This phonetic is found in the 5th letter of each
                  family (row). It sounds like: the "ai" in air, the "a" in
                  alien, and more.
                </li>
                <li>
                  <b>ə:</b> This phonetic is found in the 6th letter of each
                  family (row). It sounds like: the second "e" in even, the "a"
                  in woman, the "i" in family, and more.
                </li>
                <li>
                  <b>o:</b> This phonetic is found in the 7th letter of each
                  family (row). It sounds like: the "o" from ogre, old, or the
                  word "or".
                </li>
                <li>
                  <b>' :</b> This symbol is used to signify that the
                  consonant(s) before the symbol, needs some sort of stress or
                  pressure when said.
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="custom-button close" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LegendModal;
