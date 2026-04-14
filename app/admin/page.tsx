"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string; client_name: string; client_phone: string; title: string;
  status: string; pickup_location: string; created_at: string;
};

type Runner = {
  id: string; full_name: string; phone: string; location: string;
  transport_type: string; status: string; created_at: string;
};

type WaitlistUser = {
  id: string; email: string; referral_code: string; referred_by: string | null;
  role: string; location: string; created_at: string;
};

export default function AdminPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function fetchAllData() {
    setLoading(true);
    const [eRes, rRes, wRes] = await Promise.all([
      supabase.from("errands").select("*").order("created_at", { ascending: false }),
      supabase.from("runners").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false })
    ]);

    if (!eRes.error) setErrands(eRes.data || []);
    if (!rRes.error) setRunners(rRes.data || []);
    if (!wRes.error) setWaitlist(wRes.data || []);
    setLoading(false);
  }

  useEffect(() => { if (authenticated) fetchAllData(); }, [authenticated]);

  // =========================
  // 📈 GROWTH CALCULATIONS (From Old Admin)
  // =========================
  const referralMap = useMemo(() => {
    const map: Record<string, number> = {};
    waitlist.forEach((u) => { if (u.referred_by) map[u.referred_by] = (map[u.referred_by] || 0) + 1; });
    return map;
  }, [waitlist]);

  const leaderboard = Object.entries(referralMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const referralRate = waitlist.length > 0 ? (Object.keys(referralMap).length / waitlist.length) * 100 : 0;

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-sm border border-white/10 text-center">
          <h1 className="text-xl font-bold mb-4 uppercase italic">ERS Internal Command</h1>
          <input
            type="password" placeholder="Admin Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password === "ersadmin123" && setAuthenticated(true)}
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 mb-4 focus:border-green-500 outline-none text-center"
          />
          <button onClick={() => password === "ersadmin123" ? setAuthenticated(true) : alert("Denied")}
            className="w-full bg-green-500 text-black font-black py-3 rounded-xl uppercase transition hover:bg-green-400">
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">System <span className="text-green-500">Control</span></h1>
          <p className="text-gray-500 text-sm font-mono">Operations & Growth Engine</p>
        </div>
        <button onClick={fetchAllData} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-bold uppercase">
          {loading ? "Syncing..." : "Refresh All"}
        </button>
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Live Errands" value={errands.length} color="text-white" />
        <Metric label="Total Fleet" value={runners.length} color="text-blue-400" />
        <Metric label="Waitlist" value={waitlist.length} color="text-green-500" />
        <Metric label="Referral Rate" value={`${referralRate.toFixed(1)}%`} color="text-yellow-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LOGISTICS STREAM */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest italic">Live Errand Stream</h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-gray-500 bg-white/5">
                <tr><th className="p-4">Client</th><th className="p-4">Task</th><th className="p-4">Hub</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {errands.slice(0, 10).map((e) => (
                  <tr key={e.id} className="text-sm">
                    <td className="p-4 font-bold">{e.client_name}</td>
                    <td className="p-4 text-gray-400">{e.title}</td>
                    <td className="p-4 text-xs">{e.pickup_location}</td>
                    <td className="p-4"><span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-black uppercase">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIRAL LEADERBOARD (Old Admin Update) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest italic">Referral Kings</h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 space-y-4">
            {leaderboard.map((l, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                <span className="text-gray-400 font-mono text-xs">{l.code}</span>
                <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-md">{l.count} Refs</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-gray-600 text-xs italic">No referrals yet.</p>}
          </div>
        </div>
      </div>

      {/* RUNNER FLEET */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest italic text-blue-400">Fleet Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {runners.map((r) => (
            <div key={r.id} className="bg-zinc-900 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold">{r.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{r.location} • {r.transport_type}</p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem]">
      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{label}</p>
      <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}