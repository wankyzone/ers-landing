"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function RunnerPage() {
  const [loading, setLoading] = useState(true);
  const [errands, setErrands] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Profile (Wallet)
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(prof);

    // Fetch Active Job
    const { data: active } = await supabase.from("errands").select("*").eq("runner_id", user.id).eq("status", "accepted").maybeSingle();
    setActiveJob(active);

    // Fetch Available Jobs
    if (!active) {
      const { data: avail } = await supabase.from("errands").select("*").eq("status", "paid_escrow").order("created_at", { ascending: false });
      setErrands(avail || []);
    }
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));
    
    const channel = supabase.channel("runner-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "errands" }, () => fetchData())
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const update = newStatus === 'accepted' ? { status: newStatus, runner_id: user?.id } : { status: newStatus };
    
    const { error } = await supabase.from("errands").update(update).eq("id", id);
    if (error) toast.error("Action failed");
    else toast.success(`Errand ${newStatus}`);
  };

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading Engine...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      {/* WALLET HEADER */}
      <div className="max-w-2xl mx-auto mb-10 p-8 bg-gray-900 border border-green-500/20 rounded-3xl flex justify-between items-center">
        <div>
          <p className="text-gray-500 uppercase text-xs tracking-widest mb-1">Available for Withdrawal</p>
          <h2 className="text-4xl font-black text-green-500">₦{(profile?.wallet_balance_kobo / 100 || 0).toLocaleString()}</h2>
        </div>
        <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm uppercase">Withdraw</button>
      </div>

      {activeJob ? (
        <div className="max-w-2xl mx-auto p-8 border-2 border-green-500 rounded-3xl bg-gray-900 shadow-2xl shadow-green-500/10">
          <span className="text-green-500 font-mono text-xs uppercase tracking-widest">Active Execution</span>
          <h2 className="text-2xl font-bold mt-2">{activeJob.description}</h2>
          <p className="text-gray-400 mt-4 italic">📍 {activeJob.pickup_location} → {activeJob.dropoff_location}</p>
          <button onClick={() => handleStatusUpdate(activeJob.id, 'completed')} className="w-full mt-8 bg-green-500 text-black font-black py-4 rounded-xl">MARK AS COMPLETED</button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-gray-500 uppercase text-xs font-bold tracking-tighter mb-4">Available Errands</h3>
          {errands.map(errand => (
            <div key={errand.id} className="p-6 bg-gray-900 border border-white/5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{errand.description}</p>
                <p className="text-gray-500 text-sm">₦{(errand.amount_kobo / 100).toLocaleString()}</p>
              </div>
              <button onClick={() => handleStatusUpdate(errand.id, 'accepted')} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-xs uppercase">Accept</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}