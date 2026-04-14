"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function generateCode(email: string) {
  return email.split("@")[0] + Math.floor(Math.random() * 9999);
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [referredBy, setReferredBy] = useState<string | null>(null);

  // capture referral
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(ref);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    const referral_code = generateCode(email);

    const { error } = await supabase.from("waitlist").insert([
      {
        email,
        referral_code,
        referred_by: referredBy,
      },
    ]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // increment referral
    if (referredBy) {
      await supabase.rpc("increment_referral", {
        ref_code: referredBy,
      });
    }

    try {
      await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {}

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLoading(false);
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/lagos nigeria (1).jpeg"
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
            Join the private rollout of the city’s execution layer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

            <a
              href="#waitlist"
              className="bg-green-500 px-8 py-4 rounded-xl text-black font-bold"
            >
              Join Waitlist
            </a>

            <a
             href="/client"
             className="border border-white/20 px-8 py-4 rounded-xl"
             >
              Request Errand
              </a>
            <a 
            href="/runner"
            className="border border-white/20 px-8 py-4 rounded-xl"
            >
              Become a Runner
              </a>

          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="max-w-xl mx-auto py-20 px-6 text-center">

        <h2 className="text-3xl font-bold">
          Secure Early Access
        </h2>

        <p className="text-gray-400 mt-3">
          Get priority when ERS goes live.
        </p>

        <div className="mt-10">

          {success ? (
            <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
              <h3 className="text-green-400 font-bold">You're in 🚀</h3>

              <p className="mt-2 text-sm">
                Your code: <span className="text-white">{refCode}</span>
              </p>

              <a
                href={`https://wa.me/?text=Join ERS: ${shareLink}`}
                className="block mt-4 text-green-400"
              >
                Share your referral link
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-900 border border-gray-700 rounded"
              />

              <button className="w-full bg-green-500 py-3 text-black font-bold rounded">
                {loading ? "Processing..." : "Join Waitlist"}
              </button>

            </form>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-600 text-sm">
        © {new Date().getFullYear()} ERS — Lagos Execution System
      </footer>
    </main>
  );
}