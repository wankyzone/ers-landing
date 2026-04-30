"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      // Fetch profile + KYC status
      let { data: profile } = await supabase
        .from("profiles")
        .select("role, phone, is_verified, nin") // Added fields
        .eq("id", user.id)
        .single();

      // 1. New User: Create basic profile shell
      if (!profile) {
        await supabase.from("profiles").insert({ id: user.id, role: null });
        router.replace("/select-role");
        return;
      }

      // 2. No Role Selected:
      if (!profile.role) {
        router.replace("/select-role");
        return;
      }

      // 3. Role-Based Routing with Onboarding Gates
      switch (profile.role) {
        case "admin":
          router.replace("/admin");
          break;

        case "runner":
          // Gate for Runner KYC (Phone + NIN)
          if (!profile.phone || !profile.nin) {
            router.replace("/onboarding/runner");
          } else {
            router.replace("/runner");
          }
          break;

        case "client":
          // Gate for Client Info (Phone + Name)
          if (!profile.phone) {
            router.replace("/onboarding/client");
          } else {
            router.replace("/client");
          }
          break;

        default:
          router.replace("/");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-gray-400 font-mono tracking-widest uppercase text-xs">
        Syncing with ERS Core...
      </p>
    </div>
  );
}