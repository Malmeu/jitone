import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fixwave - Votre Service Après-Vente Premium",
  description: "La solution ultime de suivi de réparation en Algérie. Performance, transparence et satisfaction client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning style={{ colorScheme: 'light' }} className="light">
      <body className={`${inter.variable} font-sans antialiased bg-[#FAFAFA]`}>
        {children}
      </body>
    </html>
  );
}
