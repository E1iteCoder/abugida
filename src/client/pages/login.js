import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Login from "../components/login.jsx";
import Register from "../components/register.jsx";
import "../styles/login/login.css";

export default function Log() {
  const [searchParams] = useSearchParams();
  const [currentForm, setCurrentForm] = useState(() => {
    // Check if register query parameter is present
    return searchParams.get("register") === "true" ? "register" : "login";
  });

  useEffect(() => {
    document.title = currentForm.charAt(0).toUpperCase() + currentForm.slice(1);
  });

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  };



  
  return (
    <div className="Log">
      {currentForm === "login" ? (
        <Login onFormSwitch={toggleForm} />
      ) : (
        <Register onFormSwitch={toggleForm} />
      )}
    </div>
  );
}
