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
    if (!email) return;

    setLoading(true);

    const referral_code = generateCode(email);

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email, referral_code }]);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");

    track("signup_complete");
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">
      
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/lagos.jpeg"  // ✅ FIXED NAME (MAKE SURE FILE MATCHES THIS EXACTLY)
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
            High-trust, on-demand errand execution for Lagos. Focus on your life; we’ll handle the logistics.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
            
            <a
              href="#waitlist"
              onClick={() => track("cta_click")}
              className="bg-green-500 hover:bg-green-400 transition-all px-10 py-5 rounded-2xl text-black font-bold text-lg shadow-2xl shadow-green-500/20 active:scale-95"
            >
              Join Waitlist
            </a>

            <a
              href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS"
              onClick={() => track("runner_click")}
              className="backdrop-blur-xl bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
            >
              Become a Runner
            </a>

          </div>
        </div>
      </section>

      {/* PRODUCT CORE */}
      <div className="max-w-6xl mx-auto px-6 py-32 space-y-40">
        
        {/* PROBLEM / SOLUTION */}
        <section className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">
              Lagos is fast. <br/>
              <span className="text-green-500">Your errands should be too.</span>
            </h2>
            <p className="text-gray-400 text-xl leading-relaxed">
              Traffic and unreliability stall growth. ERS provides the logistics layer needed to bypass the chaos through a network of verified professional runners.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
              <h3 className="text-green-500 font-bold uppercase tracking-widest text-xs mb-2">The Problem</h3>
              <p className="text-gray-300">Wasted hours, zero transparency, and high-friction execution.</p>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 p-8 rounded-3xl backdrop-blur-sm">
              <h3 className="text-green-500 font-bold uppercase tracking-widest text-xs mb-2">The Solution</h3>
              <p className="text-gray-200 font-medium">Verified runners, real-time dispatch, and guaranteed completion.</p>
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section id="waitlist" className="max-w-3xl mx-auto py-20 px-6">
          <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-[3rem] p-10 md:p-16 text-center">
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Join the <span className="text-green-500 underline decoration-green-500/30 underline-offset-8">Waitlist</span>
            </h2>

            <p className="mt-6 text-gray-400 text-lg max-w-md mx-auto">
              Private beta launch in Lekki and Victoria Island coming soon.
            </p>

            <div className="mt-10 max-w-md mx-auto">

              {success ? (
                <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl">

                  <div className="text-4xl mb-4">🚀</div>

                  <h3 className="text-green-500 font-bold text-xl">
                    You're on the list
                  </h3>

                  <p className="text-gray-400 mt-2 text-sm">
                    Invite 3 friends to move up the list.
                  </p>

                  <a
                    href={`https://wa.me/2348061695138?text=Join%20ERS:%20${shareLink}`}
                    onClick={() => track("referral_share")}
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
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-green-500 text-center"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20"
                  >
                    {loading ? "Registering..." : "Get Early Access"}
                  </button>

                </form>
              )}

              <a
                href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20use%20ERS"
                onClick={() => track("whatsapp_click")}
                className="inline-block mt-8 text-sm text-gray-500 hover:text-green-500"
              >
                Priority WhatsApp Access →
              </a>

            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold tracking-widest uppercase">ERS Engine</span>
        </div>
        
        <p className="text-gray-600 text-[10px] uppercase tracking-widest text-center">
          © {new Date().getFullYear()} Wanky Software. Built for high-speed execution.
        </p>
        
        <div className="text-green-500/50 text-[10px] uppercase tracking-widest">
          Status: Operational
        </div>

      </footer>
    </main>
  );
}