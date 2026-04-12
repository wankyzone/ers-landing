import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // Title optimized for SEO keywords
  title: "ERS — Errand Runners System | Reliable Logistics in Lagos",
  description:
    "On-demand errand execution powered by trusted local runners in Lagos. High-speed, high-trust logistics for Lekki, VI, and beyond.",
  
  // WhatsApp / Social Media Preview (OpenGraph)
  openGraph: {
    title: "ERS — Errand Runners System",
    description: "On-demand errand execution powered by trusted local runners in Lagos.",
    url: "https://ers.wankysoftware.com",
    siteName: "ERS",
    images: [
      {
        url: "/lagos.jpg", // This uses your hero image for social previews
        width: 1200,
        height: 630,
        alt: "ERS Lagos Dispatch Engine",
      },
    ],
    locale: "en_NG",
    type: "website",
  },

  // Twitter Preview
  twitter: {
    card: "summary_large_image",
    title: "ERS — Errand Runners System",
    description: "The logistics layer for Lagos. Vetted runners on demand.",
    images: ["/lagos.jpg"],
  },

  // Search Engine Bot Instructions
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
        {/* PASTE YOUR GOOGLE VERIFICATION TAG BELOW 
            It looks like: <meta name="google-site-verification" content="YOUR_CODE_HERE" />
        */}
      </head>
      <body className="min-h-full bg-black text-white flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}