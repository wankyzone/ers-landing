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
  user_id?: string;
  runner_id?: string | null;
  runner_name?: string | null;
};

export default function ClientPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("Client");
  const [clientPhone, setClientPhone] = useState("N/A");
  const [creating, setCreating] = useState(false);

  // 🔄 FETCH (WITH JOIN)
  const fetchErrands = async (uid: string) => {
    const { data, error } = await supabase
      .from("errands")
      .select(`
        *,
        runner:runner_id (
          full_name
        )
      `)
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("FETCH ERROR:", error);
      return;
    }

    const formatted =
      data?.map((e: any) => ({
        ...e,
        runner_name: e.runner?.full_name || null,
      })) || [];

    setErrands(formatted);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      setUserId(data.user.id);

      const name =
        data.user.user_metadata?.full_name ||
        data.user.email ||
        "Client";

      const phone =
        data.user.user_metadata?.phone ||
        data.user.phone ||
        "N/A";

      setClientName(name);
      setClientPhone(phone);

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userData || userData.role !== "client") {
        window.location.href = "/select-role";
        return;
      }

      await fetchErrands(data.user.id);
      setLoading(false);

      // 🔥 REALTIME
      supabase
        .channel("client-errands")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "errands" },
          async (payload) => {
            const updated = payload.new as Errand;

            if (updated?.user_id !== data.user?.id) return;

            await fetchErrands(data.user.id);
          }
        )
        .subscribe();
    };

    init();
  }, []);

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

  const handleCreate = async (e: any) => {
    e.preventDefault();
    if (!userId) return;

    setCreating(true);

    const form = e.target;

    const payload = {
      title: form.title.value,
      pickup_location: form.pickup.value,
      delivery_location: form.delivery.value,
      price: Number(form.price.value),
      status: "pending",
      user_id: userId,
      client_name: clientName,
      client_phone: clientPhone,
    };

    const { data, error } = await supabase
      .from("errands")
      .insert([payload])
      .select()
      .single();

    setCreating(false);

    if (error) {
      console.error("INSERT ERROR:", error);
      toast.error(error.message);
      return;
    }

    toast.success("Errand sent 🚀");

    // 🚀 DO NOT manually insert into state
    // let realtime + fetch handle it

    form.reset();
  };

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
          Real-time tracking • Trusted runners • Instant updates
        </p>
      </div>

      {/* CREATE */}
      <div className="max-w-2xl mx-auto mb-10 p-6 border border-green-500/20 rounded-2xl bg-gray-900">
        <h2 className="text-xl font-bold mb-4">Send Errand</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input name="title" placeholder="What do you need?" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="pickup" placeholder="Pickup location" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="delivery" placeholder="Delivery location" className="w-full p-3 rounded bg-black border border-white/10" required />
          <input name="price" type="number" placeholder="Price (₦)" className="w-full p-3 rounded bg-black border border-white/10" required />

          <button
            disabled={creating}
            className="w-full bg-green-500 hover:bg-green-400 transition text-black py-3 rounded font-bold"
          >
            {creating ? "Sending..." : "Send Errand"}
          </button>
        </form>
      </div>

      {/* LIST */}
      {errands.length === 0 ? (
        <div className="text-center text-gray-400">
          <p className="text-lg">No errands yet</p>
          <p className="text-sm mt-1">Create one above to get started</p>
        </div>
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

              <div className="mt-3 text-sm text-gray-300">
                {getStatusUI(errand.status)}
              </div>

              {/* 🔥 TRUST LAYER */}
              {errand.status === "accepted" && (
                <div className="mt-2 text-sm text-green-400">
                  👤 {errand.runner_name || "Runner assigned"}
                </div>
              )}

              {errand.status === "completed" && (
                <div className="mt-2 text-sm text-green-500 font-semibold">
                  🎉 Delivered successfully
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}