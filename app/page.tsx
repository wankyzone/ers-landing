"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { resolveUserRoute } from "@/lib/auth/resolver";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();

      // 🔥 Only redirect if user is logged in
      if (data.user) {
        const route = await resolveUserRoute();
        router.replace(route);
        return;
      }

      // 🔥 Not logged in → show landing page
      setCheckingAuth(false);
    };

    run();
  }, [router]);

  const handleAuth = async (intent?: "errand" | "runner") => {
    const redirectTo = `${window.location.origin}/auth/callback${
      intent ? `?intent=${intent}` : ""
    }`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  // 🔥 Prevent flash while checking auth
  if (checkingAuth) {
    return <div className="bg-black min-h-screen" />;
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Lagos Nigeria (1).jpeg"
            alt="Lagos"
            className="w-full h-full object-cover opacity-30 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-block px-3 py-1 mb-6 border border-green-500/30 rounded-full bg-green-500/10 text-green-500 text-xs font-bold tracking-widest uppercase">
            Lagos Logistics Engine
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic">
            ERS <span className="text-green-500 not-italic">—</span> SYSTEM
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            The city moves fast. We move faster. <br />
            <span className="text-white">
              Deploy a runner to the streets in seconds.
            </span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleAuth("errand")}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-400 transition-colors px-10 py-4 rounded-xl text-black font-bold shadow-lg shadow-green-500/20"
            >
              Request Errand
            </button>

            <button
              onClick={() => handleAuth("runner")}
              className="w-full sm:w-auto border border-white/10 hover:bg-white/5 transition-colors px-10 py-4 rounded-xl font-medium"
            >
              Become a Runner
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-700 text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} ERS Core — Powered by Wanky Software
      </footer>
    </main>
  );
}n