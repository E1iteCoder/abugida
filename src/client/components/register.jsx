import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login/register.css";

export default function Register({ onFormSwitch }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await register(email, pass);
      
      if (result.success) {
        console.log("User registered successfully");
        navigate("/dashboard");
      } else {
        setError(result.error || "Registration failed. Please try again.");
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
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
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
