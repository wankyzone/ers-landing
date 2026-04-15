"use client";

import { supabase } from "@/lib/supabase";

export default function Home() {

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Lagos Nigeria (1).jpeg"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight">
            ERS <span className="text-green-500">—</span> SYSTEM
          </h1>

          <p className="mt-6 text-xl text-gray-300 max-w-xl mx-auto">
            Lagos moves fast. Your errands should too.  
            Enter the city’s execution layer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

            <button
              onClick={handleGoogleLogin}
              className="bg-green-500 px-8 py-4 rounded-xl text-black font-bold"
            >
              Continue with Google
            </button>

            <button
              onClick={handleGoogleLogin}
              className="border border-white/20 px-8 py-4 rounded-xl"
            >
              Request Errand
            </button>

            <button
              onClick={handleGoogleLogin}
              className="border border-white/20 px-8 py-4 rounded-xl"
            >
              Become a Runner
            </button>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-600 text-sm">
        © {new Date().getFullYear()} ERS — Lagos Execution System
      </footer>

    </main>
  );
}