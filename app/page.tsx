"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

function generateCode(email: string) {
  return email.split("@")[0] + Math.floor(Math.random() * 9999);
}

function track(event: string) {
  console.log("ERS_EVENT:", event);
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("🚀 Form submitted with:", email);

    if (!email) {
      console.log("❌ No email entered");
      return;
    }

    setLoading(true);

    const referral_code = generateCode(email);
    console.log("🔑 Generated referral code:", referral_code);

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email, referral_code }]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      setLoading(false);
      return;
    }

    console.log("✅ Saved to Supabase");

    // ✅ SEND EMAIL (DEBUG VERSION)
    try {
      console.log("📡 Calling /api/send...");

      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      console.log("📬 API response:", data);
    } catch (err) {
      console.error("❌ Email send failed:", err);
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLoading(false);

    track("signup_complete");
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">
      
      {/* HERO */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/lagos nigeria.jpeg"
            alt="Lagos Cityscape"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div className="inline-block px-4 py-1.5 mb-6 border border-green-500/30 rounded-full bg-green-500/5 backdrop-blur-md">
            <span className="text-green-500 text-xs font-bold tracking-widest uppercase italic">
              Dispatch Engine v1.0
            </span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            ERS <span className="text-green-500">—</span> SYSTEM
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            High-trust, on-demand errand execution for Lagos.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
            <a href="#waitlist" className="bg-green-500 px-10 py-5 rounded-2xl text-black font-bold">
              Join Waitlist
            </a>

            <a
              href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS"
              className="border border-white/10 px-10 py-5 rounded-2xl"
            >
              Become a Runner
            </a>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="max-w-3xl mx-auto py-20 px-6 text-center">
        
        <h2 className="text-3xl font-bold">
          Join the <span className="text-green-500">Waitlist</span>
        </h2>

        <div className="mt-10 max-w-md mx-auto">
          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-green-500 font-bold text-xl">
                You're on the list
              </h3>
              <p className="text-gray-400 mt-2 text-sm">
                We’ll notify you when ERS goes live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-white/5 border px-6 py-4 rounded-2xl text-center"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-black font-bold py-4 rounded-2xl"
              >
                {loading ? "Registering..." : "Get Early Access"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}