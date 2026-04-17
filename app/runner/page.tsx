"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string;
  title: string;
  pickup_location: string;
  delivery_location: string;
  status: string;
  price: number;
  runner_id?: string | null;
};

export default function RunnerPage() {
  const [loading, setLoading] = useState(true);
  const [errands, setErrands] = useState<Errand[]>([]);
  const [activeJob, setActiveJob] = useState<Errand | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }

      // 🔐 ROLE CHECK
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userData || userData.role !== "runner") {
        window.location.href = "/select-role";
        return;
      }

      // 🔍 CHECK IF RUNNER HAS ACTIVE JOB
      const { data: active } = await supabase
        .from("errands")
        .select("*")
        .eq("runner_id", data.user.id)
        .eq("status", "accepted")
        .maybeSingle();

      if (active) {
        setActiveJob(active);
      } else {
        // 📦 FETCH AVAILABLE JOBS
        const { data: errandsData } = await supabase
          .from("errands")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        setErrands(errandsData || []);
      }

      setLoading(false);

      // 🔥 REALTIME
      supabase
        .channel("errands-feed")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "errands",
          },
          (payload) => {
            const updated = payload.new as Errand;

            // 🟢 NEW JOB
            if (payload.eventType === "INSERT" && updated.status === "pending") {
              setErrands((prev) => [updated, ...prev]);
            }

            // 🟡 JOB UPDATED
            if (payload.eventType === "UPDATE") {
              // if runner accepted it
              if (updated.runner_id === data.user?.id && updated.status === "accepted") {
                setActiveJob(updated);
                setErrands([]);
              }

              // remove from available if no longer pending
              if (updated.status !== "pending") {
                setErrands((prev) => prev.filter((e) => e.id !== updated.id));
              }

              // if completed, clear active job
              if (updated.status === "completed" && updated.runner_id === data.user?.id) {
                setActiveJob(null);
              }
            }
          }
        )
        .subscribe();
    };

    init();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">

      {/* 🟡 ACTIVE JOB */}
      {activeJob && (
        <div className="max-w-2xl mx-auto mb-10 p-5 border border-green-500 rounded-xl bg-gray-900">
          <h2 className="text-xl font-bold">{activeJob.title}</h2>

          <p className="text-gray-400 mt-2">
            📍 {activeJob.pickup_location} → {activeJob.delivery_location}
          </p>

          <p className="text-green-400 font-bold mt-2 text-lg">
            ₦{activeJob.price}
          </p>

          <button
            onClick={async () => {
              const { data } = await supabase.auth.getUser();
              if (!data.user) return;

              // ✅ mark completed
              await supabase
                .from("errands")
                .update({
                  status: "completed",
                  completed_at: new Date(),
                })
                .eq("id", activeJob.id);

              // 💰 record earnings
              await supabase.from("earnings").insert([
                {
                  runner_id: data.user.id,
                  errand_id: activeJob.id,
                  amount: activeJob.price,
                },
              ]);

              setActiveJob(null);
            }}
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded font-bold"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {/* 🟢 AVAILABLE JOBS */}
      {!activeJob && (
        <>
          <h1 className="text-4xl font-black text-center mb-10">
            Available Errands
          </h1>

          {errands.length === 0 ? (
            <p className="text-center text-gray-400">
              No errands available right now.
            </p>
          ) : (
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

                  <p className="text-green-400 font-bold mt-2 text-lg">
                    ₦{errand.price}
                  </p>

                  <button
                    onClick={async () => {
                      const { data } = await supabase.auth.getUser();
                      if (!data.user) return;

                      const { error } = await supabase
                        .from("errands")
                        .update({
                          status: "accepted",
                          runner_id: data.user.id,
                        })
                        .eq("id", errand.id);

                      if (error) {
                        alert("Failed to accept job");
                        return;
                      }

                      setErrands((prev) =>
                        prev.filter((e) => e.id !== errand.id)
                      );
                    }}
                    className="mt-4 bg-green-500 text-black px-4 py-2 rounded font-bold"
                  >
                    Accept Job
                  </button>
                </div>
              ))}

            </div>
          )}
        </>
      )}

    </main>
  );
}