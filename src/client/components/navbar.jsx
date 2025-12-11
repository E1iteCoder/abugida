import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../pictures/Abugida2.svg";
import "../styles/navbar.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
    if (isMobile) setIsOpen(false);
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.nav-user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

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
            <li>
              <Link className="link" to="/reference">
                Reference
              </Link>
            </li>
            <li className="nav-user-menu-container">
              {isAuthenticated ? (
                <div className={`nav-user-dropdown ${isDropdownOpen ? "nav-dropdown-open" : ""}`}>
                  <Link
                    className="link"
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDropdownToggle(e);
                    }}
                    aria-label="User menu"
                  >
                    {user?.email || "User"}
                    <span className="nav-dropdown-arrow">▼</span>
                  </Link>
                  {isDropdownOpen && (
                    <ul className="nav-user-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                      <li>
                        <Link
                          className="nav-dropdown-item"
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="nav-dropdown-item"
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="nav-dropdown-item nav-logout-item"
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                          }}
                        >
                          Logout
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <div className={`nav-user-dropdown ${isDropdownOpen ? "nav-dropdown-open" : ""}`}>
                  <Link
                    className="link"
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDropdownToggle(e);
                    }}
                    aria-label="Login menu"
                  >
                    Login
                    <span className="nav-dropdown-arrow">▼</span>
                  </Link>
                  {isDropdownOpen && (
                    <ul className="nav-user-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                      <li>
                        <Link
                          className="nav-dropdown-item"
                          to="/login"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="nav-dropdown-item"
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
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
