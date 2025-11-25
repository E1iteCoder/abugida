import React, { useState } from "react";
import "../styles/login/login.css";

export default function Login({ onFormSwitch }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      console.log("User logged in successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Login</h1>
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
        <button type="submit">Log In</button>
        <p>New to Abugida?</p>
        <button
          type="button"
          className="link-pass"
          onClick={() => onFormSwitch("register")}
        >
          Create your Abugida account
        </button>
      </form>
    </div>
  );
}
