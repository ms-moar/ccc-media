import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewOS - Master Your Tech Interviews with AI",
  description: "Your operating system for mastering tech interviews. AI-powered mock interviews with real-time feedback, adaptive difficulty, and zero judgment.",
  keywords: ["mock interview", "tech interview", "AI interview", "coding interview", "behavioral interview", "system design"],
  openGraph: {
    title: "InterviewOS - Master Your Tech Interviews with AI",
    description: "Your operating system for mastering tech interviews. AI-powered practice with real-time feedback.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0B] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
