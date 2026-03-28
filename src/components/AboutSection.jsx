// AboutSection.jsx - White Background
import React from "react";

function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-1 mb-6">
          About HealthSync
        </h2>
        <div className="space-y-4 text-gray-700 text-lg">
          <p>
            HealthSync is an AI-driven healthcare platform designed
            to assist individuals in early disease detection using
            machine learning and intelligent health data analysis.
          </p>
          <p>
            Our system leverages quality datasets, secure processing,
            and predictive analytics to empower users with actionable
            health insights.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;