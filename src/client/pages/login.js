import React, { useEffect, useState } from "react";

import Login from "../components/login.jsx";
import Register from "../components/register.jsx";
import "../styles/login/login.css";
export default function Log() {
  const [currentForm, setCurrentForm] = useState("login");

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
