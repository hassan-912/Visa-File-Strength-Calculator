import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visa File Strength Calculator | MG Visa",
  icons: {
    icon: "/Logo W.png",
  },
  description:
    "Assess your visa application file strength instantly using MG Visa's AI-powered scoring engine. Analyse travel history, financial health, employment, assets, and more.",
  keywords: [
    "visa file strength calculator",
    "visa application score",
    "visa assessment tool",
    "MG Visa calculator",
    "immigration consultancy Egypt",
    "visa approval probability",
  ],
  authors: [{ name: "MG International Visa Consultancy" }],
  openGraph: {
    title: "Visa File Strength Calculator | MG Visa",
    description:
      "Find out how strong your visa application file is with MG Visa's AI-powered analysis tool.",
    type: "website",
    url: "https://mg-visa.com",
    siteName: "MG International Visa Consultancy",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased bg-bg text-text-main">
        {children}
      </body>
    </html>
  );
}
