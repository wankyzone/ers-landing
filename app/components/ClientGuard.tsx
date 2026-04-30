"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, phone")
        .eq("id", user.id)
        .single();

      // Ensure they are a client and have a phone number
      if (!profile || profile.role !== "client") {
        router.replace("/select-role");
      } else if (!profile.phone) {
        router.replace("/onboarding/client");
      } else {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono tracking-tighter">
      VERIFYING CLIENT STATUS...
    </div>
  );

  return <>{children}</>;
}