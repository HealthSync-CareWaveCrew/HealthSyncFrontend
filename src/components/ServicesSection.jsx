import React from "react";

function ServicesSection() {
  return (
    <div className="section section-light">
      <h2 className="section-title">Our Services</h2>
      <div className="grid grid-3">
        <div className="card">
          <h3>Symptom-Based Prediction</h3>
          <p>Analyze health symptoms with AI models.</p>
        </div>
        <div className="card">
          <h3>Image-Based Diagnosis</h3>
          <p>Upload medical images for predictive analysis.</p>
        </div>
        <div className="card">
          <h3>Downloadable Reports</h3>
          <p>Get structured health prediction reports.</p>
        </div>
      </div>
    </div>
  );
}

export default ServicesSection;