"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const LAGOS_LOCATIONS = [
  "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Victoria Island", "Ikoyi", 
  "Yaba", "Ikeja", "Surulere", "Magodo", "Maryland", "Gbagada", "Festac",
];

export default function Home() {
  const [role, setRole] = useState<"client" | "runner">("client");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Lekki Phase 1");
  
  // Client Specific
  const [title, setTitle] = useState("");
  const [deliveryLoc, setDeliveryLoc] = useState("");
  
  // Runner Specific
  const [transport, setTransport] = useState("bike");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === "client") {
        const { error } = await supabase.from("errands").insert([
          {
            client_name: fullName,
            client_phone: phone,
            title: title,
            pickup_location: location,
            delivery_location: deliveryLoc,
            status: 'pending_review'
          },
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("runners").insert([
          {
            full_name: fullName,
            phone: phone,
            location: location,
            transport_type: transport,
            status: 'active'
          },
        ]);
        if (error) throw error;
      }

      setSuccess(true);
    } catch (error: any) {
      console.error("Database Error:", error);
      alert("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/Lagos Nigeria (1).jpeg" 
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
            High-Performance Logistics. Real-Time Execution.
          </p>
          <div className="mt-10">
             <a href="#action-form" className="bg-green-500 text-black px-10 py-5 rounded-2xl font-black uppercase hover:bg-green-400 transition-all">
               Deploy Now
             </a>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section id="action-form" className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-zinc-900/50 border border-white/10 rounded-[3rem] p-8 md:p-16">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tighter">
              {role === "client" ? "Request an Errand" : "Register as Runner"}
            </h2>
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex p-1 bg-black rounded-2xl border border-white/5 mb-10 max-w-md mx-auto">
            <button 
              onClick={() => { setRole("client"); setSuccess(false); }}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${role === "client" ? "bg-green-500 text-black" : "text-gray-500"}`}
            >
              Client
            </button>
            <button 
              onClick={() => { setRole("runner"); setSuccess(false); }}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${role === "runner" ? "bg-green-500 text-black" : "text-gray-500"}`}
            >
              Runner
            </button>
          </div>

          <div className="max-w-md mx-auto">
            {success ? (
              <div className="text-center bg-green-500/10 border border-green-500/20 p-10 rounded-3xl animate-in zoom-in">
                <h3 className="text-green-500 text-2xl font-bold uppercase">System Logged</h3>
                <p className="text-gray-400 mt-4">
                  {role === "client" 
                    ? "Your request is live. A dispatcher will contact you on WhatsApp shortly." 
                    : "Runner profile created. Stay active for incoming job notifications."}
                </p>
                <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-green-500 underline uppercase font-bold">New Submission</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SHARED FIELDS */}
                <input
                  type="text" required placeholder="Full Name"
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-green-500 outline-none"
                />
                <input
                  type="tel" required placeholder="WhatsApp Phone Number"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-green-500 outline-none"
                />

                {/* CLIENT SPECIFIC FIELDS */}
                {role === "client" && (
                  <>
                    <input
                      type="text" required placeholder="What do you need? (e.g. Delivery)"
                      value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-green-500 outline-none"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 ml-2">Pickup Zone</label>
                        <select
                          value={location} onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 outline-none"
                        >
                          {LAGOS_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                      </div>
                      <input
                        type="text" required placeholder="Drop-off Address/Zone"
                        value={deliveryLoc} onChange={(e) => setDeliveryLoc(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 focus:border-green-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {/* RUNNER SPECIFIC FIELDS */}
                {role === "runner" && (
                  <>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 ml-2">Primary Operating Zone</label>
                      <select
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 outline-none"
                      >
                        {LAGOS_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 ml-2">Transport Type</label>
                      <select
                        value={transport} onChange={(e) => setTransport(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-black border border-white/10 outline-none"
                      >
                        <option value="bike">Motorcycle (Bike)</option>
                        <option value="car">Car / Van</option>
                        <option value="foot">Foot / Public Transport</option>
                        <option value="bicycle">Bicycle</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-2xl text-lg uppercase transition-all mt-4"
                >
                  {loading ? "Processing..." : role === "client" ? "Send Runner" : "Join Fleet"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">© {new Date().getFullYear()} Wanky Software — Lagos Dispatch</p>
      </footer>
    </main>
  );
}