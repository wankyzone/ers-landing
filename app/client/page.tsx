"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ClientPage() {
  const [errands, setErrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchErrands = async (uid: string) => {
    const { data } = await supabase
      .from("errands")
      .select("*")
      .eq("client_id", uid)
      .order("created_at", { ascending: false });
    setErrands(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/"; return; }
      
      await fetchErrands(user.id);
      setLoading(false);

      supabase.channel("client-updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "errands" }, 
        () => fetchErrands(user.id))
        .subscribe();
    };
    init();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Syncing...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-5xl font-black italic mb-4">SYSTEM FEED</h1>
        <Link href="/client/request" className="inline-block bg-green-500 text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-transform">
          + REQUEST NEW ERRAND
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {errands.map((errand) => (
          <div key={errand.id} className="p-6 border border-white/10 rounded-2xl bg-gray-900/50">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                errand.status === 'paid_escrow' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {errand.status.replace('_', ' ')}
              </span>
              <span className="font-mono text-green-500">₦{(errand.amount_kobo / 100).toLocaleString()}</span>
            </div>
            <p className="text-lg font-medium mb-2">{errand.description}</p>
            <p className="text-gray-500 text-sm italic">📍 {errand.pickup_location} → {errand.dropoff_location}</p>
          </div>
        ))}
      </div>
    </main>
  );
}