import React, { useState, useEffect } from "react";
import hero1 from "../assets/hero.jpg";
import hero2 from "../assets/image2.jpg";
import hero3 from "../assets/image3.jpeg";
import hero4 from "../assets/image4.jpeg";

const images = [hero1, hero2, hero3, hero4];

function HeroSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 7000); // Dynamic 7-second sequence
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-container">
      {images.map((img, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentIdx ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      
      <div className="hero-content">
        <div className="hero-glass-card" data-aos="zoom-in" data-aos-duration="1200">
          <h1 className="hero-title">
            AI-Powered <br />
            <span>Disease Prediction</span>
          </h1>
          <p className="hero-subtitle">
            Revolutionizing healthcare with intelligent data analysis and 
            real-time medical AI models for proactive health management.
          </p>
          <div className="hero-actions">
            <button className="btn-primary-lg">Analyze Now</button>
            <button className="btn-secondary-outline">Learn More</button>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </div>
  );
}

export default HeroSection;