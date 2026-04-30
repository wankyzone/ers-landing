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

      // 🔥 Get profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // 🔥 If no profile → create one
      if (!profile) {
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          role: null,
        });

        if (error) {
          console.error("Profile creation error:", error);
          return;
        }

        router.replace("/select-role");
        return;
      }

      // 🔥 No role yet → go select role
      if (!profile.role) {
        router.replace("/select-role");
        return;
      }

      // 🔥 Role-based routing (clean)
      if (profile.role === "admin") {
        router.replace("/admin");
        return;
      }

      if (profile.role === "runner") {
        router.replace("/runner");
        return;
      }

      if (profile.role === "client") {
        router.replace("/client");
        return;
      }

      // 🔥 Fallback
      router.replace("/");
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