import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SectionSkeleton from "@/components/ui/SectionSkeleton";

const Features = dynamic(() => import("@/components/Features"), {
  loading: () => <SectionSkeleton className="min-h-[480px] sm:min-h-[560px]" />,
});

const Labs = dynamic(() => import("@/components/Labs"), {
  loading: () => <SectionSkeleton className="min-h-[400px] sm:min-h-[480px]" />,
});

const LearningJourney = dynamic(() => import("@/components/LearningJourney"), {
  loading: () => <SectionSkeleton className="min-h-[520px] sm:min-h-[600px]" />,
});

const HowItWorks = dynamic(() => import("@/components/HowItWorks"), {
  loading: () => <SectionSkeleton className="min-h-[360px] sm:min-h-[420px]" />,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <SectionSkeleton className="min-h-[400px] sm:min-h-[480px]" />,
});

const CTA = dynamic(() => import("@/components/CTA"), {
  loading: () => <SectionSkeleton className="min-h-[420px] sm:min-h-[480px]" />,
});

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Labs />
      <LearningJourney />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
