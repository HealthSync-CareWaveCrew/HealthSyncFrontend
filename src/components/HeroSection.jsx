// HeroSection.jsx - Updated with Tailwind
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="max-w-3xl text-center animate-float">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-2 to-primary-1 bg-clip-text text-transparent">
              HealthSync
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            AI-Powered Healthcare at Your Fingertips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-primary-1 text-white rounded-full font-semibold hover:bg-primary-1/90 transform hover:scale-105 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const aboutSection = document.getElementById('about');
                aboutSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-transparent text-white rounded-full font-semibold border-2 border-white/50 hover:bg-white hover:text-dark transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-2 w-1 h-2 bg-white rounded-full animate-scroll" />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;