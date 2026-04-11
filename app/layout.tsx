import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERS — Errand Runners System",
  description:
    "On-demand errand execution powered by trusted local runners in Lagos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}