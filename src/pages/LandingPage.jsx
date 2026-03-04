import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import WhyChooseUs from "../components/WhyChooseUs";
import ReviewsSection from "../components/ReviewsSection";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUs />
      <ReviewsSection />
      <Footer />
    </>
  );
}

export default LandingPage;