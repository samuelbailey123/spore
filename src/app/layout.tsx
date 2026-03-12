import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocationProvider } from "@/context/location-context";
import { AllergenProvider } from "@/context/allergen-context";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://spore.decimahosted.com"),
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Spore — Pollen Intelligence Dashboard",
    description:
      "Detailed pollen counts, species breakdowns, forecasts, and educational resources for allergy sufferers.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://spore.decimahosted.com",
    siteName: "Spore",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#052e16" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <LocationProvider>
          <AllergenProvider>
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
              {children}
            </main>
            <Footer />
          </AllergenProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
