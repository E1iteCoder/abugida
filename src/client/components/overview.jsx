import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import data from "../data/overviewData";
import "../styles/dashboard/overview.css";

export default function Overview({ topicKey }) {
  const { title, video, markdown } = data[topicKey];
  const [sectionText, setSectionText] = useState("");

  useEffect(() => {
    fetch(markdown)
      .then((res) => res.text())
      .then((text) => {
        // Split by markdown headings (##)
        const sections = text.split(/^##\s+/gm).filter(Boolean);

        const match = sections.find((section) => {
          const [headerLine] = section.split("\n");
          return headerLine.trim().toLowerCase() === topicKey.toLowerCase();
        });

        if (match) {
          const [, ...bodyLines] = match.split("\n");
          setSectionText(bodyLines.join("\n").trim());
        } else {
          setSectionText(`_No content found for: ${topicKey}_`);
        }
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
