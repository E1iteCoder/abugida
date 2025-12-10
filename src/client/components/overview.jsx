import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import data from "../data/overviewData";
import "../styles/dashboard/overview.css";

export default function Overview({ topicKey }) {
  // Handle case where topicKey doesn't exist in data
  if (!topicKey || !data[topicKey]) {
    return (
      <div className="overview">
        <p>Error: No overview data found for topic "{topicKey}"</p>
      </div>
    );
  }

  const { title, video, markdown } = data[topicKey];
  const [sectionText, setSectionText] = useState("");

  useEffect(() => {
    fetch(markdown)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch markdown: ${res.statusText}`);
        return res.text();
      })
      .then((text) => {
        // Split by markdown headings (##)
        const sections = text.split(/^##\s+/gm).filter(Boolean);

        // Map topicKey to possible section names (handle "letters" -> "alphabet")
        const searchKeys = [topicKey.toLowerCase()];
        if (topicKey === "letters") {
          searchKeys.push("alphabet");
        }

        // Try to find a matching section
        let match = null;
        for (const searchKey of searchKeys) {
          match = sections.find((section) => {
            const [headerLine] = section.split("\n");
            return headerLine.trim().toLowerCase() === searchKey;
          });
          if (match) break;
        }

        if (match) {
          const [, ...bodyLines] = match.split("\n");
          setSectionText(bodyLines.join("\n").trim());
        } else {
          setSectionText(`_No content found for: ${topicKey}_`);
        }
      })
      .catch((error) => {
        setSectionText(`_Error loading content: ${error.message}_`);
      });
  }, [markdown, topicKey]);

  return (
    <div className="overview">
      <h1>{title}</h1>
      <video controls width="100%">
        <source src={video} type="video/mp4" />
        Your browser doesn’t support HTML5 video.
      </video>
      <ReactMarkdown className="overview-markdown">{sectionText}</ReactMarkdown>
    </div>
  );
}
