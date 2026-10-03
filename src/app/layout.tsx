import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Fallback site URL for SEO metadata when custom domain is not yet configured
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinygrow.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TinyGrow - Little Moments, Made to Grow | Baby Clothing & Toys",
    template: "%s | TinyGrow",
  },
  description:
    "Discover premium organic baby clothing, newborn frocks, cozy booties, cute accessories, and Montessori developmental toys crafted with love and 100% baby-safe comfort.",
  keywords: [
    "TinyGrow",
    "baby clothing online India",
    "organic baby clothes",
    "newborn dresses",
    "baby frocks online",
    "cute baby accessories",
    "infant booties and caps",
    "Montessori wooden toys",
    "baby plush soft toys",
    "baby shower gifts",
    "100% organic cotton baby wear",
    "hypoallergenic infant clothes",
    "baby silicone teether rattle",
    "kids store India",
  ],
  authors: [{ name: "TinyGrow", url: siteUrl }],
  creator: "TinyGrow",
  publisher: "TinyGrow",
  category: "Baby & Toddler Clothing, Toys & Accessories",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "TinyGrow",
    title: "TinyGrow - Little Moments, Made to Grow | Baby Clothing & Toys",
    description:
      "Gentle organic baby garments, cheerful developmental toys, and cute accessories tailored with love for every growing milestone.",
    images: [
      {
        url: "/tinygrow-logo.png",
        width: 800,
        height: 600,
        alt: "TinyGrow - Little Moments, Made to Grow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TinyGrow - Little Moments, Made to Grow",
    description:
      "Discover adorable organic baby wear, soft frocks, cute booties, and infant Montessori toys.",
    images: ["/tinygrow-logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/tinygrow-favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/tinygrow-favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/tinygrow-favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakartaSans.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/tinygrow-favicon.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/tinygrow-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tinygrow-favicon.png" sizes="180x180" />
      </head>
      <body
        className="min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#FCE7F3] selection:text-[#BE185D]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
