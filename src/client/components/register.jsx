import React, { useState } from "react";
import "../styles/login/register.css";

export default function Register({ onFormSwitch }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      console.log("User registered successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}
        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="youremail@gmail.com"
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="*********"
          id="password"
          name="password"
          onChange={(e) => setPass(e.target.value)}
        />
        <button type="submit">Register</button>
        <p>Already have an account?</p>
        <button
          type="button"
          className="link-pass"
          onClick={() => onFormSwitch("login")}
        >
          Login to your Abugida account
        </button>
      </form>
    </div>
  );
}
