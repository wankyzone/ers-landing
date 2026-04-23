"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveUserRoute } from "@/lib/auth/resolver";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // 🔥 wait until session is actually available
      let attempts = 0;
      let session = null;

      while (attempts < 10) {
        const res = await supabase.auth.getSession();
        session = res.data.session;

        if (session) break;

        await new Promise((r) => setTimeout(r, 300));
        attempts++;
      }

      const route = await resolveUserRoute();
      router.replace(route);
    };

    run();
  }, [router]);

  return (
    <div className="p-6 text-white bg-black min-h-screen flex items-center justify-center">
      Authenticating...
    </div>
  );
}