import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScenarioProvider } from "@/components/ers/scenario-provider";
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
  title: "Equipment Readiness Score",
  description: "Forecasting the Member Equipment Experience",
  metadataBase: new URL("https://app.equipmentreadinessscore.com"),
  openGraph: {
    title: "Equipment Readiness Score",
    description: "Forecasting the Member Equipment Experience",
    url: "https://app.equipmentreadinessscore.com",
    siteName: "Equipment Readiness Score",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equipment Readiness Score",
    description: "Forecasting the Member Equipment Experience",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScenarioProvider>{children}</ScenarioProvider>
      </body>
    </html>
  );
}
