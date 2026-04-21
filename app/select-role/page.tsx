"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SelectRole() {
  const [loading, setLoading] = useState<"client" | "runner" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assignRole = async (role: "client" | "runner") => {
    setLoading(role);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) throw new Error("No session");

      // ✅ 1. DB (source of truth)
      const { error: dbError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        role,
      });

      if (dbError) throw dbError;

      // ✅ 2. JWT (fast access)
      const { error: jwtError } = await supabase.auth.updateUser({
        data: { role },
      });

      if (jwtError) throw jwtError;

      // 🚀 redirect
      window.location.href = role === "client" ? "/client" : "/runner";
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Choose your role</h1>

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex flex-col gap-4">
          <button
            onClick={() => assignRole("client")}
            disabled={loading !== null}
            className="bg-green-500 px-6 py-4 rounded-xl text-black font-bold"
          >
            {loading === "client" ? "Setting up..." : "I want to send errands"}
          </button>

          <button
            onClick={() => assignRole("runner")}
            disabled={loading !== null}
            className="border px-6 py-4 rounded-xl"
          >
            {loading === "runner" ? "Setting up..." : "I want to run errands"}
          </button>
        </div>
      </div>
    </main>
  );
}