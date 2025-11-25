// src/client/pages/dashboard/intro.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import sections from "../data/section";
import "../styles/dashboard/intro.css";

export default function Introduction({ topicKey, currentPage = 1 }) {
  const sectionConfig = sections.find((s) => s.key === topicKey);
  const [entryMap, setEntryMap] = useState({}); // will hold page entries
  const [bodyText, setBodyText] = useState(""); // markdown body
  const [error, setError] = useState(""); // error message

  useEffect(() => {
    if (!sectionConfig) {
      setError(`Unknown module: ${topicKey}`);
      return;
    }

    const { labelUrl } = sectionConfig;
    const mdUrl = `/intro/${topicKey}.md`;

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

  // If we ran into an error, show it and bail
  if (error) {
    return (
      <div className="module-overview">
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  // Safely extract just the strings we need
  const entry = entryMap[String(currentPage)] || {};
  const pageLabel = entry.label || "";
  const pageVideo = entry.video || "";

  return (
    <div className="module-overview">
      <h2>Introduction — Page {currentPage}</h2>

      {/* Only render the label string, never the object */}
      {pageLabel && <h3>{pageLabel}</h3>}

      {/* Only render the video element */}
      {pageVideo && (
        <video controls width="100%" style={{ margin: "1rem 0" }}>
          <source src={pageVideo} type="video/mp4" />
          Your browser doesn’t support HTML5 video.
        </video>
      )}

      {/* Render the bodyText string as markdown */}
      <ReactMarkdown className="intro-markdown">{bodyText}</ReactMarkdown>
    </div>
  );
}
