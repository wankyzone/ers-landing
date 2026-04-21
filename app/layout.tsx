import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import React from "react";
import RoleSyncProvider from "./components/RoleSyncProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";

export const metadata: Metadata = {
  title: "ERS — Errand Runners System | Reliable Logistics in Lagos",
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
        {/* ✅ client wrapper */}
        <RoleSyncProvider>{children}</RoleSyncProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}

export default function RootLayout({ children }: any) {
  const router = useRouter();

  useEffect(() => { 
    const check = async () => {
      const status = await useOnboardingGuard();

      if (status === "NO_AUTH") router.push("/login");
      if (status === "NO_KYC") router.push("/kyc");
      if (status === "PENDING_KYC") router.push("/kyc/pending");
    };

    check();
  }, []);

  return <html><body>{children}</body></html>;
}