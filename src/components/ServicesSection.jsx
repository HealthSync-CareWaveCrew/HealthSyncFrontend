import React from "react";

function ServicesSection() {
  const services = [
    { title: "Symptom-Based Prediction", desc: "Analyze health symptoms with AI models.", delay: "0" },
    { title: "Image-Based Diagnosis", desc: "Upload medical images for analysis.", delay: "200" },
    { title: "Downloadable Reports", desc: "Get structured health reports.", delay: "400" }
  ];

  return (
    <div id="services" className="section section-light">
      <h2 className="section-title" data-aos="fade-right">Our Services</h2>
      <div className="grid grid-3">
        {services.map((s, i) => (
          <div key={i} className="card" data-aos="fade-up" data-aos-delay={s.delay}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicesSection;