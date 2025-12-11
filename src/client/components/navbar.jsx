import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../pictures/Abugida2.svg";
import "../styles/navbar.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    if (isMobile) setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="header" to="/home">
          <img alt="Logo" src={logo} className="logo" />
        </Link>

        <div
          className={`nav-links-container ${isOpen ? "active" : ""}`}
          onClick={() => isMobile && setIsOpen(false)}
        >
          <ul className="nav-links">
            <li>
              <Link className="link" to="/home">
                Home
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {user && (
                  <li>
                    <span className="link" style={{ cursor: "default", color: "var(--fg)" }}>
                      {user.email}
                    </span>
                  </li>
                )}
                <li>
                  <button
                    className="link"
                    onClick={handleLogout}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    Logout
                  </button>
                </li>
                <li>
                  <Link className="link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link className="link" to="/login">
                  Login
                </Link>
              </li>
            )}
            <li>
              <Link className="link" to="/reference">
                Reference
              </Link>
            </li>
            <li>
              <Link className="link" to="/settings">
                Settings
              </Link>
            </li>
          </ul>
        </div>

        <button
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
}
