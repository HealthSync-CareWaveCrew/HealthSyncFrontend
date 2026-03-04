import React from "react";
import heroImage from "../assets/hero.jpg";

function HeroSection() {
  return (
    <div
      className="hero"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="hero-overlay">
        <h1>AI-Powered Disease Prediction</h1>
        <p>
          Early detection through intelligent data analysis and
          medical AI models for better health decisions.
        </p>
        <button className="btn-primary">Get Started</button>
      </div>
    </div>
  );
}

export default HeroSection;