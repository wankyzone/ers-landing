"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveUserRoute } from "@/lib/auth/resolver";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      let session = null;

      // 🔥 wait for session properly
      for (let i = 0; i < 10; i++) {
        const res = await supabase.auth.getSession();
        session = res.data.session;

        if (session?.user) break;

        await new Promise((r) => setTimeout(r, 300));
      }

      if (!session?.user) {
        console.log("❌ No session after wait");
        router.replace("/login");
        return;
      }

      const route = await resolveUserRoute();
      console.log("➡️ Redirecting to:", route);

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