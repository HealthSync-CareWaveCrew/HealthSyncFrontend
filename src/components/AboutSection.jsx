import React from "react";
import { FaShieldAlt, FaMicrochip, FaUserMd } from "react-icons/fa";

function AboutSection() {
  return (
    <section id="about" className="section bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-aos="fade-right">
          <h2 className="text-brand-coral font-bold tracking-widest uppercase mb-4">About HealthSync</h2>
          <h3 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
            We Bridge Science with <span className="text-brand-pink">Intelligence</span>
          </h3>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            HealthSync isn't just a tool; it's your personal health companion. By analyzing thousands of 
            data points, our AI identifies patterns long before symptoms appear.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-4 bg-brand-cream rounded-2xl text-brand-coral text-2xl"><FaShieldAlt /></div>
              <div>
                <h4 className="font-bold text-xl mb-1">Secure Data Encryption</h4>
                <p className="text-gray-500">Your health data is encrypted with military-grade protocols.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-4 bg-brand-cream rounded-2xl text-brand-coral text-2xl"><FaMicrochip /></div>
              <div>
                <h4 className="font-bold text-xl mb-1">Global AI Models</h4>
                <p className="text-gray-500">Trained on diverse global clinical datasets for maximum accuracy.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative" data-aos="fade-left">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-gold rounded-full blur-3xl opacity-30"></div>
          <div className="relative bg-brand-cream p-4 rounded-[40px] transform hover:rotate-2 transition-transform duration-500 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
              alt="Medical AI" 
              className="rounded-[35px] w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;