"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SelectRole() {
  const [loading, setLoading] = useState(false);

  const setRole = async (role: "client" | "runner") => {
    setLoading(true);

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      window.location.href = "/";
      return;
    }

    const user = data.user;

    // 🔥 IMPORTANT: check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let dbError;

    if (existingUser) {
      // UPDATE
      const { error } = await supabase
        .from("users")
        .update({ role })
        .eq("id", user.id);

      dbError = error;
    } else {
      // INSERT
      const { error } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          role,
        },
      ]);

      dbError = error;
    }

    if (dbError) {
      console.error("ROLE SAVE ERROR:", dbError.message);
      alert("Failed to save role. Check console.");
      setLoading(false);
      return;
    }

    // 🚀 redirect
    if (role === "client") {
      window.location.href = "/client";
    } else {
      window.location.href = "/runner";
    }
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
            disabled={loading}
          >
            {loading ? "Loading..." : "I want to send errands"}
          </button>

          <button
            onClick={() => setRole("runner")}
            className="border border-white/20 px-6 py-4 rounded-xl"
            disabled={loading}
          >
            {loading ? "Loading..." : "I want to run errands"}
          </button>

        </div>

      </div>
    </main>
  );
}