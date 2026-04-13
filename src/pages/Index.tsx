import {
  Navbar,
  Hero,
  Partners,
  AboutUs,
  Features,
  HowItWorks,
  Insights,
  Reviews,
  FAQ,
  Pricing,
  Footer,
  ContactUs,
  ParallaxStars,
} from "@/components";

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
      <Reviews />
      <FAQ />
      <Pricing />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default Index;
