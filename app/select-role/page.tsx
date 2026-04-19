"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = "client" | "runner";

export default function SelectRole() {
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setRole = async (role: Role) => {
    setLoading(role);
    setError(null);

    try {
      // 1. Get authenticated user (authoritative session)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (sessionError || !user) {
        throw new Error("Session not found. Please log in again.");
      }

      // 2. Write role to SINGLE source of truth (users table)
      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          role: role,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (upsertError) {
        throw upsertError;
      }

      // 3. Re-fetch from DB (authoritative verification step)
      const { data: verifiedUser, error: verifyError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (verifyError || !verifiedUser?.role) {
        throw new Error("Role verification failed. Check DB or RLS policies.");
      }

      const finalRole = verifiedUser.role as Role;

      console.log("ROLE SAVED + VERIFIED:", finalRole);

      // 4. HARD ROUTE (no fallback logic anywhere)
      if (finalRole === "client") {
        window.location.replace("/client");
        return;
      }

      if (finalRole === "runner") {
        window.location.replace("/runner");
        return;
      }

      throw new Error("Invalid role returned from database.");
    } catch (err: any) {
      console.error("ROLE SET ERROR:", err);
      setError(err.message || "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center space-y-6 w-full max-w-md">

        <h1 className="text-3xl font-bold">
          How do you want to use ERS?
        </h1>

        <p className="text-white/60 text-sm">
          This determines your experience across the platform.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 mt-6">

          <button
            onClick={() => setRole("client")}
            disabled={loading !== null}
            className="bg-green-500 px-6 py-4 rounded-xl text-black font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading === "client" ? "Setting up workspace..." : "I want to send errands"}
          </button>

          <button
            onClick={() => setRole("runner")}
            disabled={loading !== null}
            className="border border-white/20 px-6 py-4 rounded-xl hover:bg-white/5 transition disabled:opacity-50"
          >
            {loading === "runner" ? "Setting up workspace..." : "I want to run errands"}
          </button>

        </div>
      </div>
    </main>
  );
}