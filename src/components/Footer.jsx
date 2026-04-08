import React, { useState } from "react";
import { subscribeNewsletter } from "../Redux/Api/api"; 

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMsg("");

    try {
      const response = await subscribeNewsletter(email);
      if (response.data.status === "success") {
        setStatus("success");
        setMsg("Welcome! Check your inbox for verification.");
        setEmail("");
        // Reset message after 5 seconds
        setTimeout(() => {
          setStatus("idle");
          setMsg("");
        }, 5000);
      }
    } catch (error) {
      setStatus("error");
      setMsg(error.response?.data?.message || "Subscription failed. Try again.");
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <h3>Stay ahead with Health AI</h3>
          <p>Get the latest insights on predictive healthcare once a week.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "..." : status === "success" ? "Subscribed!" : "Subscribe"}
          </button>
        </form>
        {msg && (
          <p className={`status-msg ${status === "success" ? "success" : "error"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <h2 className="footer-logo">Health<span>Sync</span></h2>
            <p>
              Leading the revolution in predictive healthcare with advanced AI 
              modeling and real-time diagnostic insights.
            </p>
            <div className="social-links">
              <span className="social-icon">𝕏</span>
              <span className="social-icon">in</span>
              <span className="social-icon">f</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Health Analysis</a></li>
              <li><a href="#disease">Disease Tracking</a></li>
              <li><a href="#remote">Remote Monitoring</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API Reference</a></li>
              <li><a href="#case">Case Studies</a></li>
              <li><a href="#blog">Health Blog</a></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Contact</h4>
            <div className="contact-item">
              <span className="icon">📍</span>
              <p>Silicon Valley, CA 94025</p>
            </div>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <p>support@healthsync.ai</p>
            </div>
            <div className="contact-item">
              <span className="icon">📞</span>
              <p>+1 (555) 000-HEALTH</p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="footer-bottom-bar">
        <div className="bottom-content">
          <p>© {new Date().getFullYear()} <strong>HealthSync</strong>. Transforming care through AI.</p>
          <div className="bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;