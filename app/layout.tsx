import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RepairTrack DZ - Suivi de Réparation",
  description: "Suivez vos réparations en temps réel. Simple, rapide et transparent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-[#FAFAFA]`}>
        {children}
      </body>
    </html>
  );
}
