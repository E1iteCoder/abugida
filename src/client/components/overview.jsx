import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import data from "../data/overviewData";
import "../styles/dashboard/overview.css";
import { useProgressTracking } from "../hooks/useProgressTracking";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

export default function Overview({ topicKey }) {
  const { trackProgress } = useProgressTracking();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
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

  // Show checkbox after 7 minutes
  useEffect(() => {
    if (!video) {
      setShowCheckbox(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setShowCheckbox(true);
    }, 7 * 60 * 1000); // 7 minutes

    return () => clearTimeout(timer);
  }, [video]);

  // Check if Introduction 0 is already completed
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkProgress = async () => {
      try {
        const response = await authAPI.getProgress();
        const progress = response.progress;
        if (progress?.completedSections?.[topicKey]?.["Introduction"]?.["0"]) {
          setVideoWatched(true);
        }
      } catch (error) {
        // Silently handle errors
      }
    };
    
    checkProgress();
  }, [topicKey, isAuthenticated]);

  // Reset checkbox state when topic changes (but keep videoWatched if already completed)
  useEffect(() => {
    setShowCheckbox(false);
  }, [topicKey]);

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
      <video
        ref={videoRef}
        controls
        width="100%"
      >
        <source src={video} type="video/mp4" />
        Your browser doesn't support HTML5 video.
      </video>
      
      {/* Show checkbox after 7 minutes */}
      {showCheckbox && (
        <div className="video-watched-checkbox">
          <label>
            <input
              type="checkbox"
              checked={videoWatched}
              onChange={async (e) => {
                const checked = e.target.checked;
                setVideoWatched(checked);
                await trackProgress(topicKey, "Introduction", 0, checked);
              }}
            />
            <span>I watched the video</span>
          </label>
        </div>
      )}
      <ReactMarkdown className="overview-markdown">{sectionText}</ReactMarkdown>
    </div>
  );
}
