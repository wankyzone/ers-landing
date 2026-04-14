"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const LAGOS_LOCATIONS = [
  "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Victoria Island",
  "Ikoyi", "Yaba", "Ikeja", "Surulere", "Gbagada"
];

export default function ClientPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [pickup, setPickup] = useState("Lekki Phase 1");
  const [delivery, setDelivery] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("errands").insert([
        {
          client_name: fullName,
          client_phone: phone,
          title,
          pickup_location: pickup,
          delivery_location: delivery,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      <h1 className="text-4xl font-black text-center mb-10">
        Request an Errand
      </h1>

      <div className="max-w-md mx-auto">
        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
            <h2 className="text-green-400 font-bold text-xl">Request Submitted 🚀</h2>
            <p className="text-gray-400 mt-2">We’ll contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
              required
            />

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
              required
            />

            <input
              placeholder="What do you need?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
              required
            />

            <select
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
            >
              {LAGOS_LOCATIONS.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>

            <input
              placeholder="Delivery location"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
              required
            />

            <button className="w-full bg-green-500 text-black py-3 rounded font-bold">
              {loading ? "Processing..." : "Send Request"}
            </button>

          </form>
        )}
      </div>

    </main>
  );
}