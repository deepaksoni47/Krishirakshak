import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "KrishiRakshak AI | Multi-Agent Climate-Adaptive Farming Advisor",
  description: "An agentic AI agriculture advisor designed to support crop disease detection, weather intelligence, risk assessment, and government scheme recommendations.",
  keywords: [
    "Agriculture AI",
    "Climate-Adaptive Farming",
    "Crop Disease Detection",
    "LangGraph",
    "Gemini API",
    "SDG 2",
    "Zero Hunger"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
