"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RunnerGuard({ children }: { children: React.ReactNode }) {
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
        .select("role, phone, nin")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "runner") {
        router.replace("/select-role");
      } else if (!profile.phone || !profile.nin) {
        router.replace("/onboarding/runner");
      } else {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono tracking-tighter">
      VERIFYING RUNNER KYC...
    </div>
  );

  return <>{children}</>;
}