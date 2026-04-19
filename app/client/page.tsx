"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Errand = {
  id: string;
  title: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  price: number;
  user_id: string;
  runner_name?: string | null;
};

export default function ClientPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [clientName, setClientName] = useState("Client");
  const [clientPhone, setClientPhone] = useState("N/A");

  // -----------------------------
  // FETCH ERRANDS (SOURCE OF TRUTH)
  // -----------------------------
  const fetchErrands = async (uid: string) => {
    const { data, error } = await supabase
      .from("errands")
      .select(`
        id,
        title,
        pickup_location,
        delivery_location,
        status,
        price,
        user_id,
        runner_id
      `)
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }

    setErrands(data || []);
  };

  // -----------------------------
  // INIT
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();

      const user = sessionData?.session?.user;

      if (!user) {
        window.location.href = "/";
        return;
      }

      const userId = user.id;

      // role check
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (!userData || userData.role !== "client") {
        window.location.href = "/select-role";
        return;
      }

      // metadata
      setClientName(
        user.user_metadata?.full_name || user.email || "Client"
      );

      setClientPhone(user.user_metadata?.phone || "N/A");

      // initial fetch
      await fetchErrands(userId);

      setLoading(false);

      // -----------------------------
      // REALTIME (FIXED)
      // -----------------------------
      supabase
        .channel("client-errands")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "errands" },
          (payload) => {
            const updated = payload.new as Errand;

            if (!updated || updated.user_id !== userId) return;

            setErrands((prev) => {
              const exists = prev.find((e) => e.id === updated.id);

              if (exists) {
                return prev.map((e) =>
                  e.id === updated.id ? updated : e
                );
              }

              return [updated, ...prev];
            });
          }
        )
        .subscribe();
    };

    init();
  }, []);

  // -----------------------------
  // CREATE ERRAND
  // -----------------------------
  const handleCreate = async (e: any) => {
    e.preventDefault();
    setCreating(true);

    const form = e.target;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      toast.error("Not authenticated");
      setCreating(false);
      return;
    }

    const payload = {
      title: form.title.value,
      pickup_location: form.pickup.value,
      delivery_location: form.delivery.value,
      price: Number(form.price.value),
      status: "pending",
      user_id: user.id,
      client_name: clientName,
      client_phone: clientPhone,
    };

    const { error } = await supabase
      .from("errands")
      .insert([payload]);

    setCreating(false);

    if (error) {
      console.error("INSERT ERROR:", error);
      toast.error(error.message);
      return;
    }

    toast.success("Errand created 🚀");

    form.reset();

    // IMPORTANT: re-fetch to avoid sync drift
    await fetchErrands(user.id);
  };

  // -----------------------------
  // STATUS UI
  // -----------------------------
  const getStatusUI = (status: string) => {
    switch (status) {
      case "pending":
        return "🟡 Waiting for a runner...";
      case "accepted":
        return "🚀 Runner assigned";
      case "completed":
        return "✅ Completed";
      default:
        return "Unknown";
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      {/* HEADER */}
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black">Your Errands</h1>
        <p className="text-gray-400 mt-2">
          Real-time tracking • Lagos dispatch system
        </p>
      </div>

      {/* CREATE FORM */}
      <div className="max-w-2xl mx-auto mb-10 p-6 border border-green-500/20 rounded-2xl bg-gray-900">
        <h2 className="text-xl font-bold mb-4">Create Errand</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input name="title" placeholder="What do you need?" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="pickup" placeholder="Pickup location" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="delivery" placeholder="Delivery location" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="price" type="number" placeholder="Price (₦)" className="w-full p-3 rounded bg-black border border-white/10" required />

          <button
            disabled={creating}
            className="w-full bg-green-500 text-black py-3 rounded font-bold"
          >
            {creating ? "Sending..." : "Send Errand"}
          </button>
        </form>
      </div>

      {/* LIST */}
      {errands.length === 0 ? (
        <p className="text-center text-gray-400">
          No errands yet — create one above.
        </p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {errands.map((errand) => (
            <div
              key={errand.id}
              className="p-6 border border-white/10 rounded-2xl bg-gray-900"
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">{errand.title}</h2>
                <span className="text-green-400 font-bold">
                  ₦{errand.price}
                </span>
              </div>

              <p className="text-gray-400 mt-2">
                📍 {errand.pickup_location} → {errand.delivery_location}
              </p>

              <p className="mt-3 text-sm text-gray-300">
                {getStatusUI(errand.status)}
              </p>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}