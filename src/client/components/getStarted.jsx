import React from "react";
import { Link } from "react-router-dom";
import "../styles/home/getStarted.css";

export default function GetStarted() {
  return (
    <div className="get-started">
      <h2 className="get-started-heading">Let's get started</h2>
      <p className="get-started-description">
        If you are ready to learn Amharic so that you can impress your family and understand more about the Ethiopian culture, click the button below to start
      </p>
      <Link to="/login?register=true" className="get-started-button">
        Sign up to get started
      </Link>
    </div>
  );
}

