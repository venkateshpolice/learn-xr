import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "ARScape | Nexscape",
    description: "View immersive AR experience — scan to explore in augmented reality.",
    openGraph: { url: `/ar/view/${slug}` },
  };
}

export default function ARViewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
