import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Labs from "@/components/Labs";
import TargetAudience from "@/components/TargetAudience";
import LearningJourney from "@/components/LearningJourney";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Labs />
      {/* <TargetAudience /> */}
      <LearningJourney />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
