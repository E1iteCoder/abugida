// src/pages/dashboard/letterTracer.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/dashboard/letterTracer.css";
import letterDetails from "../data/letterDetails.js";
import audioMap from "../data/audio.js";

export default function LetterTracer({ currentPage = 1 }) {
  const itemsPerPage = 14;
  const [alphabet, setAlphabet] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) turn your JSON into an array of {letter, phonetic, audio}
    const all = Object.entries(letterDetails).map(([letter, info]) => ({
      letter,
      phonetic: info.phonetic,
      audio: audioMap[info.audio] || "",
    }));

    // 2) slice out this page
    const pageIdx = Math.max(0, currentPage - 1);
    const start = pageIdx * itemsPerPage;
    const end = start + itemsPerPage;

    setAlphabet(all.slice(start, end));
    setLoading(false);
  }, [currentPage]);

  const goToNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, alphabet.length - 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  if (loading) return <p>Loading tracing cards...</p>;
  if (!alphabet.length) return <p>No letters found.</p>;

  const current = alphabet[currentIndex];

  return (
    <div className="lettertracer-slider-container">
      <div className="lettertracer-card">
        <h3>
          {current.letter} <span>({current.phonetic})</span>
        </h3>
        <button
          className="sound-button"
          onClick={() => current.audio && new Audio(current.audio).play()}
        >
          🔊 Play Sound
        </button>
        <CanvasTracer letter={current.letter} />
      </div>

      <div className="slider-controls">
        <button onClick={goToPrevious} disabled={currentIndex === 0}>
          ←
        </button>
        <span>
          {currentIndex + 1} / {alphabet.length}
        </span>
        <button
          onClick={goToNext}
          disabled={currentIndex === alphabet.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
}

function CanvasTracer({ letter }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 200;
    canvas.height = 200;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineWidth = 10;
    context.strokeStyle = "#000";
    setCtx(context);

    drawGuide(context, letter);
  }, [letter]);

  const drawGuide = (ctx, letter) => {
    ctx.clearRect(0, 0, 200, 200);
    ctx.font = "140px Arial";
    ctx.fillStyle = "#f0f0f0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter.toUpperCase(), 100, 100);
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };
  const draw = (e) => {
    if (!isDrawing.current) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };
  const stopDrawing = () => {
    isDrawing.current = false;
  };
  const clearCanvas = () => drawGuide(ctx, letter);

  return (
    <div className="canvas-trace-wrapper">
      <canvas
        ref={canvasRef}
        className="tracer-canvas"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        style={{ touchAction: "none" }}
      />
      <button onClick={clearCanvas} className="clear-button">
        Clear
      </button>
    </div>
  );
}
