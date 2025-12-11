import { useState, useEffect } from "react";
import "../styles/reference/modal.css";

export default function FlashcardSettingsModal({ show, onClose, onSave, currentSettings }) {
  const [frontSide, setFrontSide] = useState(currentSettings?.frontSide || "term");
  const [backSide, setBackSide] = useState(currentSettings?.backSide || "definition");
  const [order, setOrder] = useState(currentSettings?.order || "randomized");

  // Update state when modal opens with current settings
  useEffect(() => {
    if (show && currentSettings) {
      setFrontSide(currentSettings.frontSide || "term");
      setBackSide(currentSettings.backSide || "definition");
      setOrder(currentSettings.order || "randomized");
    }
  }, [show, currentSettings]);

  const handleSave = () => {
    onSave({
      frontSide,
      backSide,
      order,
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Flashcard Settings</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="settings-group">
            <label>
              <strong>Front Side:</strong>
              <select
                value={frontSide}
                onChange={(e) => setFrontSide(e.target.value)}
              >
                <option value="term">Term</option>
                <option value="definition">Definition</option>
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              <strong>Back Side:</strong>
              <select
                value={backSide}
                onChange={(e) => setBackSide(e.target.value)}
              >
                <option value="term">Term</option>
                <option value="definition">Definition</option>
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              <strong>Order:</strong>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="linear">Linear</option>
                <option value="randomized">Randomized</option>
              </select>
            </label>
          </div>

          {frontSide === backSide && (
            <p style={{ color: "#ff4444", marginTop: "0.5rem", fontSize: "0.9rem", marginBottom: 0 }}>
              ⚠️ Front and back sides cannot be the same!
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="custom-button close"
            onClick={handleSave}
            disabled={frontSide === backSide}
          >
            Save Settings
          </button>
          <button className="custom-button close" onClick={onClose} style={{ marginLeft: "0.5rem" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

