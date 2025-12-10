import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import {
  faGem,
  faHome,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <section className="footer-section">
        <div>
          <span className="social-header">
            Get connected with me on social networks:
          </span>
        </div>
        <div className="social-icons">
          <a href="https://discord.gg/bfb8fpstAx" target="_blank">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a
            href="https://www.instagram.com/official.dani.mekuria/"
            target="_blank"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="http://www.linkedin.com/in/daniel-mekuria-022715214"
            target="_blank"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        </div>
      </section>

      <section className="footer-container">
        <div className="footer-row">
          <div className="footer-col">
            <h6>
              <FontAwesomeIcon icon={faGem} className="me-3" /> Abugida
            </h6>
            <p>
              Abugida is the Amharic learning website here to teach you the
              Amharic language.
            </p>
          </div>

          <div className="footer-col">
            <h6>Navigation</h6>
            <p>
              <Link to="/home">Home</Link>
            </p>
            <p>
              <Link to="/login">Login</Link>
            </p>
            <p>
              <Link to="/dashboard">Dashboard</Link>
            </p>
            <p>
              <Link to="/reference">Reference</Link>
            </p>
          </div>

          <div className="footer-col">
            <h6>Contact</h6>
            <div className="icon-row">
              <p>
                <FontAwesomeIcon icon={faHome} className="me-2 icon" />
                Pflugerville, TX 78660, US
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} className="me-3 icon" />
                support@theabugida.org
              </p>
              <p>
                <FontAwesomeIcon icon={faPhone} className="me-3 icon" /> + 1 512
                587 0501
              </p>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
