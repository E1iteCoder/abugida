import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login/login.css";

export default function Login({ onFormSwitch }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(usernameOrEmail, pass);
      
      if (result.success) {
        console.log("User logged in successfully");
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}
        <label htmlFor="usernameOrEmail">Username or Email</label>
        <input
          type="text"
          placeholder="username or youremail@gmail.com"
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="*********"
          id="password"
          name="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
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
