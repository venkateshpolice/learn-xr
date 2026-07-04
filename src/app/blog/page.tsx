import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogList from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog | Nexscape",
  description:
    "Articles on immersive AR & VR education, interactive teaching methods, and why experiential learning works for students.",
};

export default function BlogPage() {
  return (
    <main>
      <Navbar />
      <BlogList />
      <Footer />
    </main>
  );
}
