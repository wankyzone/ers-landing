"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const LAGOS_LOCATIONS = [
  "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Victoria Island", "Ikoyi",
  "Yaba", "Ikeja", "Surulere", "Magodo", "Maryland", "Gbagada", "Festac",
];

function track(event: string, payload?: any) {
  console.log("ERS_EVENT:", event, payload || "");
}

export default function Home() {
  const [role, setRole] = useState<"client" | "runner">("client");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Lekki Phase 1");

  const [title, setTitle] = useState("");
  const [deliveryLoc, setDeliveryLoc] = useState("");

  const [transport, setTransport] = useState("bike");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("🚀 Submission started:", {
      role, email, fullName, phone, location
    });

    setLoading(true);

    try {
      if (role === "client") {
        const { error } = await supabase.from("errands").insert([
          {
            client_name: fullName,
            client_phone: phone,
            client_email: email, // ✅ FIXED
            title,
            pickup_location: location,
            delivery_location: deliveryLoc,
            status: "pending_review",
          },
        ]);

        if (error) throw error;

        track("errand_created", { email, title });

      } else {
        const { error } = await supabase.from("runners").insert([
          {
            full_name: fullName,
            phone,
            email, // ✅ FIXED
            location,
            transport_type: transport,
            status: "pending_review", // 🔥 better than auto-active
          },
        ]);

        if (error) throw error;

        track("runner_registered", { email, transport });
      }

      // OPTIONAL: send email
      try {
        await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn("Email failed (non-blocking):", err);
      }

      setSuccess(true);

    } catch (error: any) {
      console.error("❌ Submission error:", error);
      alert("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">

      {/* HERO */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Lagos Nigeria (1).jpeg"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black uppercase">
            ERS <span className="text-green-500">—</span> SYSTEM
          </h1>

          <p className="mt-6 text-gray-400 text-xl">
            High-performance logistics. Real-time execution.
          </p>

          <a
            href="#form"
            className="mt-10 inline-block bg-green-500 px-8 py-4 rounded-xl text-black font-bold"
          >
            Deploy Now
          </a>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="max-w-3xl mx-auto py-20 px-6">

        {/* ROLE SWITCH */}
        <div className="flex mb-8 bg-gray-900 rounded-xl overflow-hidden">
          <button
            onClick={() => { setRole("client"); setSuccess(false); }}
            className={`flex-1 py-3 ${role === "client" ? "bg-green-500 text-black" : ""}`}
          >
            Client
          </button>
          <button
            onClick={() => { setRole("runner"); setSuccess(false); }}
            className={`flex-1 py-3 ${role === "runner" ? "bg-green-500 text-black" : ""}`}
          >
            Runner
          </button>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-xl text-center">
            <h3 className="text-green-400 text-xl font-bold">System Logged 🚀</h3>
            <p className="text-gray-400 mt-3">
              {role === "client"
                ? "Your errand has been queued for review."
                : "Your runner profile is under review."}
            </p>

            <button
              onClick={() => setSuccess(false)}
              className="mt-6 text-green-400 underline"
            >
              Submit another
            </button>
          </div>
        ) : (

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700"
            />

            <input
              required
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700"
            />

            {role === "client" && (
              <>
                <input
                  required
                  placeholder="Errand Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700"
                />

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700"
                >
                  {LAGOS_LOCATIONS.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>

                <input
                  required
                  placeholder="Delivery Location"
                  value={deliveryLoc}
                  onChange={(e) => setDeliveryLoc(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700"
                />
              </>
            )}

            {role === "runner" && (
              <>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700"
                >
                  {LAGOS_LOCATIONS.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>

                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700"
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="foot">Foot</option>
                </select>
              </>
            )}

            <button
              disabled={loading}
              className="w-full bg-green-500 py-3 text-black font-bold"
            >
              {loading ? "Processing..." : "Submit"}
            </button>

          </form>
        )}
      </section>

      <footer className="text-center py-10 text-gray-600 text-sm">
        © {new Date().getFullYear()} ERS — Lagos Dispatch System
      </footer>
    </main>
  );
}