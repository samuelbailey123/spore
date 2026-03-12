import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocationProvider } from "@/context/location-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  title: {
    default: "Spore — Pollen Intelligence Dashboard",
    template: "%s | Spore",
  },
  description:
    "Detailed pollen counts, species breakdowns, forecasts, and educational resources for allergy sufferers. Know exactly what's in the air.",
  metadataBase: new URL("https://spore.decimahosted.com"),
  openGraph: {
    title: "Spore — Pollen Intelligence Dashboard",
    description:
      "Detailed pollen counts, species breakdowns, forecasts, and educational resources for allergy sufferers.",
    url: "https://spore.decimahosted.com",
    siteName: "Spore",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <LocationProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
        </LocationProvider>
      </body>
    </html>
  );
}
