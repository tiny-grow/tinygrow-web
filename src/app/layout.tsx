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
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakartaSans.variable} suppressHydrationWarning>
      <body
        className="min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#FCE7F3] selection:text-[#BE185D]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
