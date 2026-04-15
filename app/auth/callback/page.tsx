"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        window.location.href = "/";
        return;
      }

      const user = data.user;

      // Save user
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        auth_provider: "google",
      });

      window.location.href = "/select-role";
    };

    handleAuth();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-pulse text-green-500 text-xl font-bold">
          ERS
        </div>

        <p className="text-gray-400">
          Signing you in...
        </p>
      </div>
    </main>
  );
}