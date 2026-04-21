"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast"; // ✅ NEW
import { channel } from "diagnostics_channel";

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
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEarning, setLastEarning] = useState<number | null>(null);

  const [user, setUser] = useState<any>(null);

  const fetchErrands = async () => {
    const { data: errandsData } = await supabase
      .from("errands")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setErrands(errandsData || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/";
        return;
      }
    
      setUser(data.user);

      const { data: earningsData } = await supabase
        .from("earnings")
        .select("*")
        .eq("runner_id", data.user.id);

      if (earningsData) {
        const total = earningsData.reduce(
          (sum, e) => sum + Number(e.amount),
          0
        );
        setTotalEarnings(total);
        setCompletedCount(earningsData.length);
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userData || userData.role !== "runner") {
        window.location.href = "/select-role";
        return;
      }

      const { data: active } = await supabase
        .from("errands")
        .select("*")
        .eq("runner_id", data.user.id)
        .eq("status", "accepted")
        .maybeSingle();

      if (active) {
        setActiveJob(active);
      } else {
        await fetchErrands();
      }

      setLoading(false);

      const channel = supabase
        .channel("errands-feed")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "errands" },
          (payload) => {
            const updated = payload.new as Errand;

            // ✅ NEW ERRAND ALERT (THIS IS THE KEY ADDITION)
            if (payload.eventType === "INSERT" && updated.status === "pending") {
              setErrands((prev) => [updated, ...prev]);

              toast.success(`🚀 ${updated.title} - ₦${updated.price}`);
            }

            if (payload.eventType === "UPDATE") {
              if (
                updated.runner_id === data.user?.id &&
                updated.status === "accepted"
              ) {
                setActiveJob(updated);
                setErrands([]);
              }

              if (updated.status !== "pending") {
                setErrands((prev) =>
                  prev.filter((e) => e.id !== updated.id)
                );
              }

              if (
                updated.status === "completed" &&
                updated.runner_id === data.user?.id
              ) {
                setActiveJob(null);
              }
            }
          }
        )
        .subscribe();
    };

    init();
  }, []);
  
  useEffect(() => {
    const channel = supabase
      .channel("runner-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new;

          // Only show if it's for this user
          if (notification.user_id === user?.id) {
            alert(notification.title + ": " + notification.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
        };  
  }, []);

  const handleComplete = async () => {
    if (!activeJob) return;

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase
      .from("errands")
      .update({
        status: "completed",
        completed_at: new Date(),
      })
      .eq("id", activeJob.id);

    await supabase.from("earnings").insert([
      {
        runner_id: data.user.id,
        errand_id: activeJob.id,
        amount: activeJob.price,
      },
    ]);


    await fetch("/api/run-fraud-check");
    
    setLastEarning(activeJob.price);
    setShowSuccess(true);

    setTotalEarnings((prev) => prev + activeJob.price);
    setCompletedCount((prev) => prev + 1);
    setActiveJob(null);

    setTimeout(async () => {
      setShowSuccess(false);
      await fetchErrands();
    }, 2500);
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

      <div className="max-w-2xl mx-auto mb-10 grid grid-cols-2 gap-4">
        <div className="p-5 bg-gray-900 rounded-xl border border-green-500/20">
          <p className="text-gray-400 text-sm">Total Earnings</p>
          <h2 className="text-2xl font-bold text-green-400">
            ₦{totalEarnings}
          </h2>
        </div>

        <div className="p-5 bg-gray-900 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">Completed Jobs</p>
          <h2 className="text-2xl font-bold">
            {completedCount}
          </h2>
        </div>
      </div>

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
            onClick={handleComplete}
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded font-bold"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {!activeJob && (
        <>
          <h1 className="text-4xl font-black text-center mb-10">
            Available Errands
          </h1>

          {errands.length === 0 ? (
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">⏳ Waiting for new errands...</p>
              <div className="animate-pulse text-sm">
                Stay online — jobs can come in anytime
              </div>
            </div>
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

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white text-black rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <h2 className="text-xl font-semibold mb-2">✅ Job Completed</h2>

            <p className="text-gray-600 mb-4">
              ₦{lastEarning?.toLocaleString()} added
            </p>

            <div className="text-sm text-gray-400 animate-pulse">
              🔄 Finding new errands...
            </div>
          </div>
        </div>
      )}
    </main>
  );
}