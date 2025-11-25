// src/client/pages/dashboard/intro.jsx
import React from "react";
import Overview from "../../components/overview"; // adjust the path if needed
import Intro from "../../components/intro";

export default function Introduction({ currentPage, topicKey }) {
  // If it's page 0, show the module overview
  if (currentPage === 0) {
    return (
      <div className="introduction-overview">
        <Overview topicKey={topicKey} />
      </div>
    );
  }

  // Otherwise show your normal intro page content
  return (
    <div className="introduction-page">
      <Intro topicKey={topicKey} currentPage={currentPage} />
    </div>
  );
}
