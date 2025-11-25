import React from "react";
import { Link } from "react-router-dom";
import "../styles/home/intro_section.css";

export default function Introsec() {
  return (
    <div className="intro_container">
      <h1>Welcome to Abugida: Your Free, Interactive Gateway to Amharic</h1>
      <p>
        Unlock Ethiopia’s spirit—learn to write, speak, and understand Amharic
        for free. Welcome to Abugida, your all-in-one interactive gateway to the
        language and culture of Ethiopia. Dive into hands-on tracing exercises,
        master essential vocabulary and phrases, explore interactive grammar
        modules, and immerse yourself in cultural insights that bring this rich
        heritage to life.
      </p>
      <p>
        As a brand-new platform dedicated to making Ethiopian culture accessible
        through language, we welcome your feedback: if you encounter any
        glitches or have suggestions, please let us know via our Feedback
        <Link className="link" to="/form">
          Form
        </Link>
        to submit your complaint and/or suggestion. We’re committed to growing
        and refining Abugida with regular updates and fresh learning strategies.
      </p>
    </div>
  );
}
