"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { resolveUserRoute } from "@/lib/auth/resolver";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const route = await resolveUserRoute();
      router.replace(route);
    };

    run();
  }, [router]);
}