// src/client/pages/dashboard/intro.jsx
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import sections from "../data/section";
import "../styles/dashboard/intro.css";
import { useProgressTracking } from "../hooks/useProgressTracking";

export default function Introduction({ topicKey, currentPage = 1 }) {
  const { trackProgress } = useProgressTracking();
  const videoRef = useRef(null);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const sectionConfig = sections.find((s) => s.key === topicKey);
  const [entryMap, setEntryMap] = useState({}); // will hold page entries
  const [bodyText, setBodyText] = useState(""); // markdown body
  const [error, setError] = useState(""); // error message

  // Reset checkbox state when page changes
  useEffect(() => {
    setShowCheckbox(false);
    setVideoWatched(false);
  }, [currentPage, topicKey]);

  useEffect(() => {
    if (!sectionConfig) {
      setError(`Unknown module: ${topicKey}`);
      return;
    }

    const { labelUrl } = sectionConfig;
    // Map topicKey to markdown filename (handle "letters" -> "alphabet")
    const mdFileName = topicKey === "letters" ? "alphabet" : topicKey;
    const mdUrl = `/intro/${mdFileName}.md`;

    async function loadContent() {
      try {
        // 1) Fetch labels.json (now objects with { label, video })
        const resLabels = await fetch(labelUrl);
        if (!resLabels.ok) throw new Error("Failed to load labels JSON");
        const labelsJson = await resLabels.json();
        setEntryMap(labelsJson);

        // 2) Fetch markdown
        const resMd = await fetch(mdUrl);
        if (!resMd.ok) throw new Error("Failed to load markdown");
        const rawText = await resMd.text();

        // 3) Split into sections, drop leading empty chunk
        const rawSections = rawText.split(/^##\s+/gm);
        if (rawSections[0].trim() === "") rawSections.shift();

        // 4) Index into the correct section (page 1→0, page 2→1, etc.)
        const idx = currentPage - 1;
        if (idx < 0 || idx >= rawSections.length) {
          throw new Error(`No content found for page ${currentPage}`);
        }

        // 5) Remove the heading line and join the rest
        const [, ...restLines] = rawSections[idx].split("\n");
        setBodyText(restLines.join("\n").trim());
      } catch (e) {
        setError(e.message);
      }
    }

    loadContent();
  }, [topicKey, currentPage, sectionConfig]);

  // Safely extract just the strings we need
  const entry = entryMap[String(currentPage)] || {};
  const pageLabel = entry.label || "";
  const pageVideo = entry.video || "";

  // Show checkbox after 7 minutes (420000 ms)
  useEffect(() => {
    if (!pageVideo) {
      setShowCheckbox(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowCheckbox(true);
    }, 7 * 60 * 1000); // 7 minutes

    return () => clearTimeout(timer);
  }, [pageVideo, currentPage]);

  // If we ran into an error, show it and bail
  if (error) {
    return (
      <div className="module-overview">
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setVideoWatched(checked);
    if (checked) {
      trackProgress(topicKey, "Introduction", currentPage, true);
    }
  };

  return (
    <div className="module-overview">
      <h2>Introduction — Page {currentPage}</h2>

      {/* Only render the label string, never the object */}
      {pageLabel && <h3>{pageLabel}</h3>}

      {/* Only render the video element */}
      {pageVideo && (
        <>
          <video
            ref={videoRef}
            controls
            width="100%"
            style={{ margin: "1rem 0" }}
          >
            <source src={pageVideo} type="video/mp4" />
            Your browser doesn't support HTML5 video.
          </video>
          
          {/* Show checkbox after 7 minutes */}
          {showCheckbox && (
            <div className="video-watched-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={videoWatched}
                  onChange={handleCheckboxChange}
                />
                <span>I watched the video</span>
              </label>
            </div>
          )}
        </>
      )}

      {/* Render the bodyText string as markdown */}
      <ReactMarkdown className="intro-markdown">{bodyText}</ReactMarkdown>
    </div>
  );
}
