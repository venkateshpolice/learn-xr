import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About Us | Nexscape",
  description:
    "Learn about Nexscape — the immersive education platform bringing AR, VR, and interactive 3D labs to students and schools across India.",
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <AboutContent />
      <Footer />
    </main>
  );
}
