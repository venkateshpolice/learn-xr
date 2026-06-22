import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TargetAudience from "@/components/TargetAudience";
import LearningJourney from "@/components/LearningJourney";
import ARExperiences from "@/components/ARExperiences";
import VRExperiences from "@/components/VRExperiences";
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
      <TargetAudience />
      <LearningJourney />
      <ARExperiences />
      <VRExperiences />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
