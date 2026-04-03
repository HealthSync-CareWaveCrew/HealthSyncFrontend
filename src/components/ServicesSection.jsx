// ServicesSection.jsx - Light Butter Background (primary-3)
import React from "react";

function ServicesSection() {
  const services = [
    { 
      title: "Symptom-Based Prediction", 
      desc: "Analyze health symptoms with advanced AI models to get accurate predictions." 
    },
    { 
      title: "Image-Based Diagnosis", 
      desc: "Upload medical images (X-rays, MRIs, etc.) for instant AI-powered analysis." 
    },
    { 
      title: "Downloadable Reports", 
      desc: "Get structured health reports that you can save, print, or share with your doctor." 
    }
  ];

  return (
    <section id="services" className="py-20 px-4 bg-primary-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-1 text-center mb-12">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border border-primary-2/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-3 hover:scale-105 hover:border-primary-1"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <h3 className="text-xl font-bold text-primary-1 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;