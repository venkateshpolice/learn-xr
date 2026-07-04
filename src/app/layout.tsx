import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexscape - Learning Beyond Books with AR & VR",
  description:
    "Transform education through immersive AR and VR experiences. Explore planets, walk through ancient civilizations, and conduct virtual science experiments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <body className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <Providers>{children}</Providers>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
