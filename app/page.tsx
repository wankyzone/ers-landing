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
      try {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          const route = await resolveUserRoute();
          router.replace(route);
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }

      // Always release UI
      setCheckingAuth(false);
    };

    run();

    // 🔥 Fail-safe: never stay stuck
    const timeout = setTimeout(() => {
      setCheckingAuth(false);
    }, 2500);

    return () => clearTimeout(timeout);
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

  // ✅ Real loading state (not blank screen)
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 tracking-wide">
            Initializing ERS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Lagos Nigeria (1).jpeg"
            alt="Lagos"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-block px-3 py-1 mb-6 border border-green-500/30 rounded-full bg-green-500/10 text-green-500 text-xs font-bold tracking-widest uppercase">
            Lagos Logistics Engine
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            Move Faster in Lagos
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            ERS connects you to verified runners across the city.
            <br />
            <span className="text-white">
              Send, receive, and execute errands instantly.
            </span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleAuth("errand")}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-400 transition-all px-10 py-4 rounded-xl text-black font-bold shadow-lg shadow-green-500/20 hover:scale-105"
            >
              Request Errand
            </button>

            <button
              onClick={() => handleAuth("runner")}
              className="w-full sm:w-auto border border-white/10 hover:bg-white/5 transition-all px-10 py-4 rounded-xl font-medium hover:scale-105"
            >
              Become a Runner
            </button>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Built for speed. Designed for Lagos.
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-gray-400">
          <div>
            <h3 className="text-white font-bold mb-2">Instant Dispatch</h3>
            <p>Get a runner assigned in seconds, not minutes.</p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-2">Trusted Network</h3>
            <p>Every runner is tracked and performance-scored.</p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-2">Real-Time Tracking</h3>
            <p>Know exactly where your errand is at all times.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-700 text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} ERS Core — Powered by Wanky Software
      </footer>
    </main>
  );
}