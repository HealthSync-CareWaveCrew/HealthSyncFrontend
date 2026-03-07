import { useEffect } from "react";
import "./../styles/landing.css"; 
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import WhyChooseUs from "../components/WhyChooseUs";
import ReviewsSection from "../components/ReviewsSection";
import Footer from "../components/Footer";


function LandingPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <>
      <Navbar/>
      <HeroSection />
      <div data-aos="fade-up"><AboutSection /></div>
      <div data-aos="fade-right"><ServicesSection /></div>
      <div data-aos="zoom-in"><WhyChooseUs /></div>
      <div data-aos="fade-left"><ReviewsSection /></div>
      <Footer/>
    </>
  );
}

export default LandingPage;


