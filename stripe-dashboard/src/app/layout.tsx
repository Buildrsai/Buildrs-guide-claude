import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WatermarkOverlay } from "@/components/shell/watermark-overlay";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard — Simulation",
  description:
    "Simulated payments dashboard. SIMULATION — DONNÉES FICTIVES.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <WatermarkOverlay />
      </body>
    </html>
  );
}
