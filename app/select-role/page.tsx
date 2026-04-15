"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SelectRole() {
  const [loading, setLoading] = useState(false);

  const setRole = async (role: "client" | "runner") => {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/";
      return;
    }

    // Save role in DB
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      role: role,
    });

    // Redirect based on role
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
            I want to send errands
          </button>

          <button
            onClick={() => setRole("runner")}
            className="border border-white/20 px-6 py-4 rounded-xl"
            disabled={loading}
          >
            I want to run errands
          </button>

        </div>

      </div>
    </main>
  );
}