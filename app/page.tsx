"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) return;

    setLoading(true);

    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setSuccess(true);
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-black text-white px-6">

      {/* HERO */}
      <section className="max-w-5xl mx-auto text-center pt-24">

        <h1 className="text-4xl md:text-6xl font-bold">
          ERS — On-Demand Errand Execution in Lagos
        </h1>

        <p className="mt-6 text-gray-300 text-lg">
          Delegate anything. Verified local runners handle your errands fast, safely, and transparently.
        </p>

        <p className="mt-3 text-gray-500 text-sm">
          Built for speed, trust, and everyday execution in Nigeria.
        </p>

        {/* HERO IMAGE */}
        <div className="mt-10">
          <img
            src="/lagos.jpg"
            alt="Lagos city"
            className="rounded-2xl w-full object-cover max-h-[420px] border border-gray-800"
          />
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#waitlist"
            className="bg-green-500 px-6 py-3 rounded-xl text-black font-semibold"
          >
            Get Early Access
          </a>

          <a
            href="https://wa.me/23480661695138?text=Hi%20I%20want%20to%20join%20ERS%20as%20a%20runner"
            className="border border-gray-600 px-6 py-3 rounded-xl"
          >
            Become a Runner
          </a>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          Launching first in Lagos — limited early access
        </p>

      </section>

      {/* PROBLEM */}
      <section className="max-w-4xl mx-auto mt-24">

        <h2 className="text-2xl font-semibold">The Problem</h2>
        <p className="text-gray-400 mt-2">
          People waste hours daily running errands — queues, traffic, stress, and unreliable help.
        </p>

        <h2 className="text-2xl font-semibold mt-10">The Solution</h2>
        <p className="text-gray-400 mt-2">
          ERS connects you to trusted runners who complete errands on demand — with tracking, speed, and accountability.
        </p>

      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto mt-24">

        <h2 className="text-2xl font-semibold">How it works</h2>

        <div className="grid md:grid-cols-3 gap-6 mt-6">

          <div className="bg-gray-900 p-6 rounded-xl">
            1. Request an errand
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            2. Assigned to a verified runner
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            3. Completed & tracked in real time
          </div>

        </div>

      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="max-w-2xl mx-auto mt-24 text-center">

        <h2 className="text-2xl font-semibold">
          Get early access
        </h2>

        <p className="text-gray-400 mt-2">
          Be among the first users when ERS launches in Lagos.
        </p>

        {/* SUCCESS STATE */}
        {success ? (
          <div className="mt-6 bg-green-900 p-6 rounded-xl">

            <p className="text-green-400 font-semibold">
              You're on the list 🚀
            </p>

            <p className="text-gray-400 text-sm mt-2">
              Share ERS with 3 friends to move higher on the early access list.
            </p>

            <a
              href="https://wa.me/23480661695138?text=I%20just%20joined%20ERS%20early%20access%20—%20you%20should%20check%20it%20out"
              className="block mt-4 text-green-400"
            >
              Share on WhatsApp
            </a>

          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col md:flex-row gap-3"
          >

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 px-6 py-3 rounded-xl text-black font-semibold"
            >
              {loading ? "Joining..." : "Join"}
            </button>

          </form>
        )}

        {/* WhatsApp fallback */}
        <a
          href="https://wa.me/23480661695138?text=Hi%20I%20want%20early%20access%20to%20ERS"
          className="block mt-4 text-green-400"
        >
          Or join via WhatsApp
        </a>

        <p className="text-gray-500 text-sm mt-4">
          Early access is now open
        </p>

      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 mt-24 pb-10">
        ERS — Built for speed, trust, and execution in Lagos.
      </footer>

    </main>
  );
}