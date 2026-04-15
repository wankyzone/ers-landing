"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error("Auth error:", error);
        window.location.href = "/login";
        return;
      }

      const user = data.user;

      // 🔥 Create or update user in your DB
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        auth_provider: "google",
      });

      // 🚀 Redirect to next step
      window.location.href = "/select-role";
    };

    handleAuth();
  }, []);

  return <p>Signing you in...</p>;
}