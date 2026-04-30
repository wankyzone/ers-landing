"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Zap } from "lucide-react"; // Optional: lucide-react for icons

export default function SelectRole() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleSelection = async (role: "client" | "runner") => {
    setLoading(role);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    if (error) {
      console.error("Role update failed:", error.message);
      setLoading(null);
      return;
    }

    // Direct them to their specific onboarding gate
    router.push(`/onboarding/${role}`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
          IDENTIFY YOUR <span className="text-green-500 text-italic">INTENT</span>
        </h2>
        <p className="text-gray-500 mb-12 font-mono uppercase tracking-widest text-sm">
          Select your operational mode within the ERS system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLIENT OPTION */}
          <button
            onClick={() => handleRoleSelection("client")}
            disabled={!!loading}
            className={`group relative p-8 border-2 transition-all text-left ${
              loading === "client" ? "border-green-500" : "border-white/10 hover:border-green-500/50"
            }`}
          >
            <div className="mb-4 text-green-500">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2 uppercase italic">I am a Client</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              I need errands executed. I want access to vetted runners and real-time tracking in Lagos.
            </p>
            {loading === "client" && <div className="absolute top-4 right-4 animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />}
          </button>

          {/* RUNNER OPTION */}
          <button
            onClick={() => handleRoleSelection("runner")}
            disabled={!!loading}
            className={`group relative p-8 border-2 transition-all text-left ${
              loading === "runner" ? "border-green-500" : "border-white/10 hover:border-green-500/50"
            }`}
          >
            <div className="mb-4 text-green-500">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2 uppercase italic">I am a Runner</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              I move the city. I want to earn by fulfilling tasks with discipline and speed.
            </p>
            {loading === "runner" && <div className="absolute top-4 right-4 animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />}
          </button>
        </div>
      </div>
    </main>
  );
}