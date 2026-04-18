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
};

export default function ClientPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>("Client");
  const [clientPhone, setClientPhone] = useState<string>("N/A");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      setUserId(data.user.id);

      // ✅ SET CLIENT NAME HERE
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

      const { data: errandsData } = await supabase
        .from("errands")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setErrands(errandsData || []);
      setLoading(false);

      // 🔥 REALTIME (FILTERED)
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

            if (updated?.user_id !== data.user?.id) return;

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

  const getStatusUI = (status: string) => {
    switch (status) {
      case "pending":
        return "🟡 Looking for a runner...";
      case "accepted":
        return "🚀 Runner assigned — in progress";
      case "completed":
        return "✅ Completed";
      default:
        return "Unknown status";
    }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();

    const form = e.target;

    const title = form.title.value;
    const pickup = form.pickup.value;
    const delivery = form.delivery.value;
    const price = form.price.value;

    if (!userId) return;

    const { data, error } = await supabase
      .from("errands")
      .insert([
        {
          title,
          pickup_location: pickup,
          delivery_location: delivery,
          price,
          status: "pending",
          user_id: userId,
          client_name: clientName,
          client_phone: clientPhone, // ✅ NOW WORKS
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("INSERT ERROR:", error);
      toast.error(error.message);
      return;
    }

    setErrands((prev) => [data, ...prev]);
    toast.success("Errand created 🚀");

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
          Create and track errands in real-time
        </p>
      </div>

      {/* CREATE FORM */}
      <div className="max-w-2xl mx-auto mb-10 p-6 border border-green-500/20 rounded-2xl bg-gray-900 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Send a New Errand</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input
            name="title"
            placeholder="What do you need?"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <input
            name="pickup"
            placeholder="Pickup location"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <input
            name="delivery"
            placeholder="Delivery location"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price (₦)"
            className="w-full p-3 rounded bg-black border border-white/10"
            required
          />

          <button className="w-full bg-green-500 hover:bg-green-400 transition text-black py-3 rounded font-bold">
            Send Errand
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
              className="p-6 border border-white/10 rounded-2xl bg-gray-900 hover:border-green-500/30 transition"
            >
              <div className="flex justify-between items-center">
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
            </div>
          ))}
        </div>
      )}

    </main>
  );
}