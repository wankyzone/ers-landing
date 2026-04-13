"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function generateCode(email: string) {
  return email.split("@")[0] + Math.floor(Math.random() * 9999);
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"client" | "runner">("client"); // Default to client
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [referrer, setReferrer] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferrer(ref);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const referral_code = generateCode(email);

    // ✅ Captured 'role' is now sent to Supabase
    const { error } = await supabase.from("waitlist").insert([
      {
        email,
        role, // 'client' or 'runner'
        referral_code,
        referred_by: referrer || null,
      },
    ]);

    if (error) {
      console.error("Database Error:", error);
      setLoading(false);
      return;
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLoading(false);
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Lagos Nigeria.jpeg" 
            alt="Lagos"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter uppercase">
            ERS <span className="text-green-500">—</span> SYSTEM
          </h1>
          <p className="mt-6 text-xl text-gray-400 font-light italic">
            Lagos Logistics. Redefined for High-Trust Execution.
          </p>
          <div className="mt-10">
             <a href="#waitlist" className="bg-green-500 text-black px-10 py-5 rounded-2xl font-black uppercase hover:bg-green-400 transition-all">
               Get Started
             </a>
          </div>
        </div>
      </section>

      {/* SEGMENTED SELECTION SECTION */}
      <section id="waitlist" className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-16">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tighter">Choose Your Path</h2>
            <p className="text-gray-500 mt-4">Join the ERS ecosystem as a client or an elite runner.</p>
          </div>

          {/* ROLE SELECTOR TOGGLE */}
          <div className="flex p-1 bg-black rounded-2xl border border-white/5 mb-10 max-w-md mx-auto">
            <button 
              onClick={() => setRole("client")}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${role === "client" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-gray-500 hover:text-white"}`}
            >
              I am a Client
            </button>
            <button 
              onClick={() => setRole("runner")}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${role === "runner" ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-gray-500 hover:text-white"}`}
            >
              I am a Runner
            </button>
          </div>

          {/* DYNAMIC SIGNUP FORM */}
          <div className="max-w-md mx-auto">
            {success ? (
              <div className="text-center bg-green-500/10 border border-green-500/20 p-10 rounded-3xl animate-in zoom-in duration-300">
                <h3 className="text-green-500 text-2xl font-bold uppercase">System Access Logged</h3>
                <p className="text-gray-400 mt-4">
                  {role === "client" 
                    ? "You will be notified as soon as a runner is dispatched to your zone." 
                    : "Onboarding instructions for new runners have been queued for your email."}
                </p>
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-500 uppercase block mb-1">Your Referral Link</span>
                  <code className="text-green-400 text-xs break-all">{shareLink}</code>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
                    {role === "client" ? "Requesting Errands" : "Earning as a Runner"}
                  </span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-5 rounded-2xl bg-black border border-white/10 focus:border-green-500 transition-all text-center outline-none text-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-2xl text-lg uppercase transition-all"
                >
                  {loading ? "Registering..." : `Join as ${role}`}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">© {new Date().getFullYear()} Wanky Software — Lagos Dispatch</p>
      </footer>
    </main>
  );
}