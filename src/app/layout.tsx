import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TinyGrow - Little Moments, Made to Grow | Baby Clothing & Toys",
  description:
    "Discover adorable and gentle baby clothing, little accessories, and joyful toys made with love and safety for your little ones.",
  icons: {
    icon: [
      { url: "/tinygrow-favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/tinygrow-favicon.png", type: "image/png" },
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
        <link rel="icon" href="/tinygrow-favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/tinygrow-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tinygrow-favicon.png" />
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
