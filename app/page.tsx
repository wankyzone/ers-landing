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

    if (!email) return;

    setLoading(true);

    const referral_code = generateCode(email);
    console.log("🔑 Generated referral code:", referral_code);

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email, referral_code }]);

    if (error) {
      console.error("❌ Supabase error:", error);
      setLoading(false);
      return;
    }

    console.log("✅ Saved to Supabase");

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
      console.error("❌ Email failed:", err);
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLoading(false);

    track("signup_complete");
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      
      {/* ================= HERO ================= */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 z-0">
          <img
            src="/lagos.jpeg"
            alt="Lagos"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            ERS <span className="text-green-500">—</span> Errand Execution System
          </h1>

          <p className="mt-6 text-gray-300 text-lg md:text-xl">
            Lagos moves fast. Your errands should too.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            
            <a
              href="#waitlist"
              onClick={() => track("cta_click")}
              className="bg-green-500 hover:bg-green-400 px-8 py-4 rounded-xl text-black font-bold"
            >
              Join Waitlist
            </a>

            <a
              href={`https://wa.me/2348061695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS`}
              className="border border-gray-600 px-8 py-4 rounded-xl"
            >
              Become a Runner
            </a>
          </div>
        </div>
      </section>

      {/* ================= PROBLEM / SOLUTION ================= */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16">
        
        <div>
          <h2 className="text-3xl font-bold mb-4">The Problem</h2>
          <p className="text-gray-400">
            Time is wasted running errands manually. No structure. No trust layer.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4 text-green-500">The Solution</h2>
          <p className="text-gray-300">
            ERS connects you to verified runners who execute tasks fast, safely, and transparently.
          </p>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          How it Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Request an errand",
            "Get matched with a runner",
            "Track completion in real time",
          ].map((step, i) => (
            <div key={i} className="bg-gray-900 p-6 rounded-xl text-center">
              <p className="text-green-500 font-bold mb-2">
                0{i + 1}
              </p>
              <p className="text-gray-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WAITLIST ================= */}
      <section id="waitlist" className="max-w-2xl mx-auto px-6 pb-24 text-center">
        
        <h2 className="text-3xl font-bold">
          Get Early Access
        </h2>

        <p className="text-gray-400 mt-3">
          Join the ERS private launch in Lagos.
        </p>

        <div className="mt-8">

          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-xl">
              
              <div className="text-4xl mb-4">🚀</div>

              <h3 className="text-green-500 font-bold text-xl">
                You're on the list
              </h3>

              <p className="text-gray-400 mt-2">
                Share your link to move up the queue.
              </p>

              <a
                href={`https://wa.me/2348061695138?text=Join%20ERS:%20${shareLink}`}
                className="block mt-4 text-green-400"
              >
                Share on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-5 py-4 rounded-xl bg-gray-900 border border-gray-700 text-center"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl"
              >
                {loading ? "Registering..." : "Get Early Access"}
              </button>
            </form>
          )}

          <a
            href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20use%20ERS"
            className="block mt-6 text-sm text-gray-500 hover:text-green-500"
          >
            Or join via WhatsApp →
          </a>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="text-center text-gray-500 py-10 border-t border-white/5">
        © {new Date().getFullYear()} Wanky Software — ERS
      </footer>
    </main>
  );
}