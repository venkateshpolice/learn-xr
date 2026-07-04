import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | Nexscape",
  description:
    "Get in touch with the Nexscape team — school demos, technical support, partnerships, and general inquiries.",
};

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={null}>
        <ContactContent />
      </Suspense>
      <Footer />
    </main>
  );
}
