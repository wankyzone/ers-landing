"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return alert("Enter a valid email");
    setLoading(true);

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Something went wrong");
    } else {
      setSuccess(true);
      setEmail("");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">
      
      {/* HERO SECTION WITH IMAGE */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/lagos.jpg" // Place your image in public folder and name it this
            alt="Lagos Cityscape"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            ERS <span className="text-green-500">—</span> Errand Runners System
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            On-demand errand execution powered by trusted local runners in Lagos.
          </p>

          <div className="mt-10 flex flex-col sm:row justify-center gap-4">
            <a
              href="#waitlist"
              className="bg-green-500 hover:bg-green-400 transition-colors px-8 py-4 rounded-full text-black font-bold text-lg shadow-lg shadow-green-500/20"
            >
              Join Waitlist
            </a>
            <a
              href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS"
              className="backdrop-blur-md bg-white/10 border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all"
            >
              Become a Runner
            </a>
          </div>
        </div>
      </section>

      {/* CORE CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-32">
        
        {/* PROBLEM / SOLUTION */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-green-500">The Problem</h2>
            <p className="text-gray-400 mt-4 text-lg">
              Time is Lagos' scarcest resource. People waste hours in traffic for simple errands, and there’s no verified system for reliable execution.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl">
            <h2 className="text-3xl font-bold text-green-500">The Solution</h2>
            <p className="text-gray-400 mt-4 text-lg">
              ERS connects you with verified runners who complete errands fast, safely, and transparently while you focus on what matters.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Request", desc: "Tell us what you need done." },
              { step: "2", title: "Match", desc: "Get paired with a verified Lagos runner." },
              { step: "3", title: "Done", desc: "Track execution and receive delivery." }
            ].map((item) => (
              <div key={item.step} className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-colors">
                <span className="text-5xl font-black text-gray-800">{item.step}</span>
                <h3 className="text-xl font-bold mt-4">{item.title}</h3>
                <p className="text-gray-400 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WAITLIST */}
        <section id="waitlist" className="max-w-2xl mx-auto text-center py-16 bg-green-500/5 rounded-3xl border border-green-500/20">
          <h2 className="text-4xl font-bold">Get Early Access</h2>
          <p className="text-gray-400 mt-4">We’re launching soon in Lagos. Secure your spot.</p>

          {success ? (
            <div className="mt-8 bg-green-500/20 p-6 rounded-xl border border-green-500/50 mx-6">
              <p className="text-green-400 font-bold text-lg">You're on the list 🚀</p>
              <p className="text-gray-400 text-sm mt-2">We'll notify you when we go live.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col md:row gap-3 px-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-6 py-4 rounded-full bg-gray-900 border border-gray-700 focus:border-green-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 px-10 py-4 rounded-full text-black font-bold whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Now"}
              </button>
            </form>
          )}
          
          <a href="https://wa.me/2348061695138" className="inline-block mt-6 text-green-500 hover:underline">
            Or join via WhatsApp
          </a>
        </section>
      </div>

      <footer className="text-center text-gray-600 py-12 border-t border-gray-900">
        © {new Date().getFullYear()} ERS — Built for speed and trust in Lagos.
      </footer>
    </main>
  );
}