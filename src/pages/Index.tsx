import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Partners from "@/components/landing/Partners";
import AboutUs from "@/components/landing/AboutUs";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Insights from "@/components/landing/Insights";
import FAQ from "@/components/landing/FAQ";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import ParallaxStars from "@/components/landing/ParallaxStars";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParallaxStars />
      <Navbar />
      <Hero />
      <Partners />
      <AboutUs />
      <Features />
      <HowItWorks />
      <Insights />
      <FAQ />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
