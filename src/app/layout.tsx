import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const BASE_URL = "https://saudiacabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Saudia Cabs — Umrah Transportation Services in Saudi Arabia",
    template: "%s | Saudia Cabs",
  },
  description:
    "Trusted Umrah transportation in Makkah, Madinah & Jeddah. Airport transfers, Ziyarat tours, Makkah–Madinah transfers & group packages. Available 24/7. Book on WhatsApp.",
  keywords: [
    "umrah ride",
    "umrah transportation",
    "makkah airport transfer",
    "madinah airport transfer",
    "jeddah airport to makkah",
    "ziyarat tour makkah",
    "ziyarat tour madinah",
    "makkah madinah transfer",
    "umrah car rental saudi arabia",
    "hajj umrah transport",
    "saudia cabs",
    "umrah taxi service",
    "group umrah transport",
  ],
  authors: [{ name: "Saudia Cabs" }],
  creator: "Saudia Cabs",
  publisher: "Saudia Cabs",
  formatDetection: { telephone: true, email: false },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-US": BASE_URL,
      "ar-SA": BASE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Saudia Cabs",
    title: "Saudia Cabs — Umrah Transportation Services in Saudi Arabia",
    description:
      "Trusted Umrah transportation in Makkah, Madinah & Jeddah. Airport transfers, Ziyarat tours, Makkah–Madinah transfers. Book on WhatsApp: +966 59 894 7503",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Saudia Cabs — Trusted Umrah Transportation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saudia Cabs — Umrah Transportation Saudi Arabia",
    description:
      "Airport transfers, Ziyarat tours, Makkah–Madinah transfers. Available 24/7. Book on WhatsApp.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Geo targeting for Saudi Arabia
  other: {
    "geo.region": "SA-02",
    "geo.placename": "Makkah, Saudi Arabia",
    "geo.position": "21.3891;39.8579",
    "ICBM": "21.3891, 39.8579",
    "language": "English",
    "revisit-after": "7 days",
    "rating": "general",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full`}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

