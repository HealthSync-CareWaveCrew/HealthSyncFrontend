// WhyChooseUs.jsx - White Background
import React from "react";

function WhyChooseUs() {
  const features = [
    { 
      title: "High Quality Data", 
      desc: "Trained using validated medical datasets for accurate results." 
    },
    { 
      title: "Secure & Private", 
      desc: "End-to-end encrypted user data protection with strict privacy policies." 
    },
    { 
      title: "AI Precision", 
      desc: "Advanced machine learning models with high accuracy rates." 
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-1 text-center mb-12">
          Why Choose HealthSync?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-primary-4 p-8 rounded-2xl border border-primary-2/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-3 hover:scale-105 hover:border-primary-1 text-center"
              data-aos="flip-left"
              data-aos-delay={i * 100}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <div className="w-8 h-8 bg-primary-1 rounded-full" />
              </div>
              <h3 className="text-xl font-bold text-primary-1 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;