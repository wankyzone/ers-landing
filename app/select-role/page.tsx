"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SelectRole() {
  const [loading, setLoading] = useState<"client" | "runner" | null>(null);

  const setRole = async (role: "client" | "runner") => {
    setLoading(role);

    // ✅ ALWAYS use session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const user = sessionData?.session?.user;

    if (sessionError || !user) {
      console.error("SESSION ERROR:", sessionError);
      window.location.href = "/";
      return;
    }

    // ✅ SINGLE ATOMIC UPSERT
    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: role,
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("ROLE SAVE ERROR:", error);

      alert("Failed to save role. Check console.");

      setLoading(null);
      return;
    }

    // ✅ HARD VERIFY (prevents redirect loop)
    const { data: verify, error: verifyError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (verifyError || !verify) {
      console.error("VERIFY ERROR:", verifyError);
      alert("Role saved but could not verify. Check RLS.");
      setLoading(null);
      return;
    }

    console.log("ROLE VERIFIED:", verify.role);

    // 🚀 SAFE REDIRECT
    window.location.href = verify.role === "client" ? "/client" : "/runner";
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">

        <h1 className="text-3xl font-bold">
          How do you want to use ERS?
        </h1>

        <div className="flex flex-col gap-4 mt-6">

          <button
            onClick={() => setRole("client")}
            className="bg-green-500 px-6 py-4 rounded-xl text-black font-bold"
            disabled={loading !== null}
          >
            {loading === "client" ? "Setting up..." : "I want to send errands"}
          </button>

          <button
            onClick={() => setRole("runner")}
            className="border border-white/20 px-6 py-4 rounded-xl"
            disabled={loading !== null}
          >
            {loading === "runner" ? "Setting up..." : "I want to run errands"}
          </button>

        </div>

      </div>
    </main>
  );
}