import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ERS — Errand Runners System | Reliable Logistics in Lagos",
  description:
    "On-demand errand execution powered by trusted local runners in Lagos. High-speed, high-trust logistics for Lekki, VI, and beyond.",

  openGraph: {
    title: "ERS — Errand Runners System",
    description:
      "On-demand errand execution powered by trusted local runners in Lagos.",
    url: "https://ers.wankysoftware.com",
    siteName: "ERS",
    images: [
      {
        url: "/lagos.jpg",
        width: 1200,
        height: 630,
        alt: "ERS Lagos Dispatch Engine",
      },
    ],
    locale: "en_NG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ERS — Errand Runners System",
    description: "The logistics layer for Lagos. Vetted runners on demand.",
    images: ["/Lagos Nigeria (1).jpeg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        {/* Optional: Google verification tag */}
      </head>
      <body className="min-h-full bg-black text-white flex flex-col font-sans">
        {children}

        {/* ✅ TOASTER GOES HERE */}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}