"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";

export default function ClientGuard({ children }: any) {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const path = window.location.pathname;

      if (path.startsWith("/login") || path.startsWith("/kyc")) return;

      const status = await useOnboardingGuard();

      if (status === "NO_AUTH") router.push("/login");
      if (status === "NO_KYC") router.push("/kyc");
      if (status === "PENDING_KYC") router.push("/kyc/pending");
    };

    check();
  }, []);

  return children;
}