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
  const [role, setRole] = useState("client");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("🚀 Submitting:", { email, role, location });

    if (!email) return;

    setLoading(true);

    const referral_code = generateCode(email);

    const { error } = await supabase.from("waitlist").insert([
      {
        email,
        referral_code,
        role,
        location,
      },
    ]);

    if (error) {
      console.error("❌ Supabase error:", error);
      setLoading(false);
      return;
    }

    console.log("✅ Saved to DB");

    try {
      await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLocation("");
    setLoading(false);

    track("signup_complete");
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/lagos nigeria.jpeg"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="relative text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black">
            ERS <span className="text-green-500">—</span> SYSTEM
          </h1>

          <p className="mt-6 text-gray-300 text-xl max-w-xl mx-auto">
            The execution layer for Lagos. Errands done fast, safely, and on-demand.
          </p>

          <div className="mt-10 flex gap-4 justify-center">
            <a href="#waitlist" className="bg-green-500 px-6 py-3 rounded-xl text-black font-bold">
              Join Waitlist
            </a>

            <a
              href="https://wa.me/2348061695138?text=Hi%20I%20want%20to%20become%20a%20runner%20on%20ERS"
              className="border px-6 py-3 rounded-xl"
            >
              Become a Runner
            </a>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="max-w-2xl mx-auto py-20 px-6 text-center">

        <h2 className="text-3xl font-bold">
          Secure Early Access
        </h2>

        <p className="text-gray-400 mt-2">
          Join the private beta rollout in Lagos.
        </p>

        <div className="mt-10">

          {success ? (
            <div className="bg-green-500/10 p-8 rounded-xl border border-green-500/20">
              <h3 className="text-green-500 text-xl font-bold">You're in 🚀</h3>

              <p className="mt-3 text-gray-400 text-sm">
                Your code: <span className="text-white">{refCode}</span>
              </p>

              <a
                href={`https://wa.me/?text=Join%20ERS:%20${shareLink}`}
                className="block mt-4 text-green-400"
              >
                Share on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <input
                type="email"
                required
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded bg-gray-900 border border-gray-700"
              />

              {/* ROLE */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-3 rounded bg-gray-900 border border-gray-700"
              >
                <option value="client">I need errands done</option>
                <option value="runner">I want to be a runner</option>
              </select>

              {/* LOCATION */}
              <input
                type="text"
                placeholder="Your area (Lekki, Yaba, VI...)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 py-3 rounded bg-gray-900 border border-gray-700"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 py-3 rounded text-black font-bold"
              >
                {loading ? "Processing..." : "Get Access"}
              </button>

            </form>
          )}

          <a
            href={`https://wa.me/2348061695138?text=Hi%20I%20want%20early%20access%20to%20ERS`}
            className="block mt-6 text-gray-500 text-sm"
          >
            Or join via WhatsApp →
          </a>

        </div>
      </section>
    </main>
  );
}