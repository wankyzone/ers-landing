"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string;
  title: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  runner_id: string | null;
  client_id: string | null;
};

export default function ClientPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errands, setErrands] = useState<Errand[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [pickup, setPickup] = useState("Lekki Phase 1");
  const [delivery, setDelivery] = useState("");

  // 🔐 INIT
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userData || userData.role !== "client") {
        window.location.href = "/select-role";
        return;
      }

      // fetch user's errands
      const { data: errandsData } = await supabase
        .from("errands")
        .select("*")
        .eq("client_id", data.user.id)
        .order("created_at", { ascending: false });

      setErrands(errandsData || []);
      setLoading(false);

      // 🔥 REALTIME
      supabase
        .channel("client-errands")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "errands",
          },
          (payload) => {
            const updated = payload.new as Errand;

            if (updated.client_id !== data.user.id) return;

            if (payload.eventType === "INSERT") {
              setErrands((prev) => [updated, ...prev]);
            }

            if (payload.eventType === "UPDATE") {
              setErrands((prev) =>
                prev.map((e) => (e.id === updated.id ? updated : e))
              );
            }
          }
        )
        .subscribe();
    };

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await supabase.auth.getUser();

      const { error } = await supabase.from("errands").insert([
        {
          client_id: data.user?.id,
          client_name: fullName,
          client_phone: phone,
          title,
          pickup_location: pickup,
          delivery_location: delivery,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setFullName("");
      setPhone("");
      setTitle("");
      setDelivery("");
    } catch (err: any) {
      alert(err.message);
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      <h1 className="text-4xl font-black text-center mb-10">
        Your Errands
      </h1>

      {/* FORM */}
      <div className="max-w-md mx-auto mb-16">
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
            <option>Lekki Phase 1</option>
            <option>Yaba</option>
            <option>Ikeja</option>
          </select>

          <input
            placeholder="Delivery location"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
            required
          />

          <button className="w-full bg-green-500 text-black py-3 rounded font-bold">
            {submitting ? "Processing..." : "Send Request"}
          </button>

        </form>
      </div>

      {/* ERRANDS LIST */}
      <div className="max-w-2xl mx-auto space-y-4">

        {errands.map((errand) => (
          <div
            key={errand.id}
            className="p-5 border border-white/10 rounded-xl bg-gray-900"
          >
            <h2 className="text-xl font-bold">{errand.title}</h2>

            <p className="text-gray-400 mt-2">
              📍 {errand.pickup_location} → {errand.delivery_location}
            </p>

            <p className="mt-2">
              Status:{" "}
              <span className="text-green-400">{errand.status}</span>
            </p>

            {errand.runner_id && (
              <p className="text-sm text-gray-500">
                Runner assigned
              </p>
            )}
          </div>
        ))}

      </div>

    </main>
  );
}