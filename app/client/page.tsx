"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string;
  title: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  price: number;
};

export default function ClientPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      // 🔐 ensure client role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userData || userData.role !== "client") {
        window.location.href = "/select-role";
        return;
      }

      // 📦 fetch errands for this client
      const { data: errandsData } = await supabase
        .from("errands")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setErrands(errandsData || []);
      setLoading(false);

      // 🔥 realtime updates
      supabase
        .channel("client-errands")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "errands" },
          (payload) => {
            const updated = payload.new as Errand;

            if (updated) {
              setErrands((prev) =>
                prev.map((e) =>
                  e.id === updated.id ? updated : e
                )
              );
            }
          }
        )
        .subscribe();
    };

    init();
  }, []);

  const getStatusUI = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <p className="text-yellow-400 font-semibold">
            🟡 Looking for a runner...
          </p>
        );

      case "accepted":
        return (
          <p className="text-blue-400 font-semibold">
            🚀 Runner assigned — in progress
          </p>
        );

      case "completed":
        return (
          <p className="text-green-400 font-semibold">
            ✅ Completed
          </p>
        );

      default:
        return (
          <p className="text-gray-400">
            Unknown status
          </p>
        );
    }
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

      <h1 className="text-4xl font-black text-center mb-10">
        Your Errands
      </h1>

      {errands.length === 0 ? (
        <p className="text-center text-gray-400">
          You haven’t created any errands yet.
        </p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {errands.map((errand) => (
            <div
              key={errand.id}
              className="p-5 border border-white/10 rounded-xl bg-gray-900"
            >
              <h2 className="text-xl font-bold">
                {errand.title}
              </h2>

              <p className="text-gray-400 mt-2">
                📍 {errand.pickup_location} → {errand.delivery_location}
              </p>

              <p className="text-green-400 font-bold mt-2">
                ₦{errand.price}
              </p>

              <div className="mt-3">
                {getStatusUI(errand.status)}
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}