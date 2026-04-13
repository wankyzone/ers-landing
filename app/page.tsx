"use client";

import { useState, useEffect } from "react";
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
  const [referrer, setReferrer] = useState("");

  // ✅ CAPTURE REF FROM URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferrer(ref);
      console.log("🔗 Ref captured:", ref);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const referral_code = generateCode(email);

    // ✅ INSERT INTO SUPABASE (WITH REFERRAL)
    const { error } = await supabase.from("waitlist").insert([
      {
        email,
        referral_code,
        referred_by: referrer || null,
      },
    ]);

    if (error) {
      console.error("❌ Supabase error:", error);
      setLoading(false);
      return;
    }

    // Email API call
    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
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
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Lagos Nigeria (1).jpeg" // Matching your verified filename
            alt="Lagos"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="inline-block px-4 py-1 mb-6 border border-green-500/30 rounded-full bg-green-500/5 backdrop-blur-sm">
            <span className="text-green-500 text-xs font-bold tracking-[0.2em] uppercase">
              Dispatch Engine v1.0
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
            ERS <span className="text-green-500">—</span> System
          </h1>

          <p className="mt-8 text-gray-300 text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
            Lagos moves fast. Your errands should too. The high-trust execution layer for your daily tasks.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
            <a
              href="#waitlist"
              onClick={() => track("cta_click")}
              className="bg-green-500 hover:bg-green-400 px-10 py-5 rounded-2xl text-black font-bold text-lg transition-all active:scale-95 shadow-lg shadow-green-500/10"
            >
              Join Waitlist
            </a>

            <a
              href="https://wa.me/23480661695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS"
              className="backdrop-blur-md bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Become a Runner
            </a>
          </div>
        </div>
      </section>

      {/* CORE VALUE PROPS */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">The Problem</h2>
          <p className="text-gray-400 text-xl leading-relaxed">
            Manual errands are a friction point for Lagos high-performers. No structure, no accountability, and zero transparency.
          </p>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 p-10 rounded-[2.5rem] backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-green-500 tracking-tight">The Solution</h2>
          <p className="text-gray-200 text-xl mt-6 leading-relaxed font-medium">
            ERS connects you to a fleet of vetted runners who execute tasks with real-time telemetry and guaranteed security.
          </p>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { t: "Request", d: "Deploy a task via our encrypted channel." },
            { t: "Match", d: "System pair with the closest vetted runner." },
            { t: "Track", d: "Watch execution live until delivery." },
          ].map((step, i) => (
            <div key={i} className="group p-10 rounded-3xl border border-white/5 bg-white/[0.01] hover:border-green-500/30 transition-all">
              <p className="text-green-500 font-black text-xs tracking-widest mb-4 uppercase">
                Phase 0{i + 1}
              </p>
              <h3 className="text-2xl font-bold mb-3">{step.t}</h3>
              <p className="text-gray-500 leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section id="waitlist" className="max-w-3xl mx-auto px-6 pb-32 text-center">
        <div className="bg-gradient-to-b from-gray-900/50 to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px]" />
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
            Get Early Access
          </h2>
          <p className="text-gray-400 mt-6 text-lg font-light">
            Join the private launch in Lagos. Priority given to referrals.
          </p>

          <div className="mt-12">
            {success ? (
              <div className="animate-in zoom-in duration-500 bg-green-500/10 border border-green-500/20 p-10 rounded-3xl">
                <div className="text-5xl mb-6">🚀</div>
                <h3 className="text-green-500 font-bold text-2xl uppercase tracking-tight">You're on the list</h3>
                <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                  Your code: <span className="text-white font-mono font-bold bg-white/10 px-2 py-1 rounded">{refCode}</span>
                </p>
                <a
                  href={`https://wa.me/?text=Join%20the%20ERS%20waitlist%20with%20me!%20${shareLink}`}
                  className="inline-block mt-8 bg-green-500 text-black font-bold px-8 py-4 rounded-xl hover:bg-green-400 transition-all uppercase tracking-tighter"
                >
                  Share on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-center text-lg focus:border-green-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-2xl text-lg transition-all shadow-xl shadow-green-500/10 uppercase"
                >
                  {loading ? "Initializing..." : "Register for Access"}
                </button>
              </form>
            )}

            <a
              href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20use%20ERS"
              className="block mt-8 text-xs font-bold text-gray-500 tracking-[0.2em] hover:text-green-500 transition-colors uppercase"
            >
              Manual Verification via WhatsApp →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center py-12 px-6 border-t border-white/5 text-[10px] tracking-[0.3em] font-bold text-gray-600 uppercase">
        <span>© {new Date().getFullYear()} Wanky Software — ERS</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <span className="text-green-500/50 italic">System Status: Active</span>
          <span>Lagos, NG</span>
        </div>
      </footer>
    </main>
  );
}