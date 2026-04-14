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
    // Fetching all three tables simultaneously
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
  // 📈 GROWTH ANALYTICS (The "Old" Logic)
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
  const viralCoefficient = waitlist.length > 0 ? Object.values(referralMap).reduce((a, b) => a + b, 0) / waitlist.length : 0;

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-sm border border-white/10 text-center">
          <h1 className="text-xl font-bold mb-4 uppercase italic tracking-tighter">ERS Command Center</h1>
          <input
            type="password" placeholder="Admin Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password === "ersadmin123" && setAuthenticated(true)}
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 mb-4 focus:border-green-500 outline-none text-center font-mono"
          />
          <button onClick={() => password === "ersadmin123" ? setAuthenticated(true) : alert("Access Denied")}
            className="w-full bg-green-500 text-black font-black py-3 rounded-xl uppercase transition hover:bg-green-400">
            Enter System
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">SYSTEM <span className="text-green-500">OVERVIEW</span></h1>
          <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Growth & Operations Intel</p>
        </div>
        <button onClick={fetchAllData} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-white/10 transition-all">
          {loading ? "Syncing..." : "Refresh All Data"}
        </button>
      </div>

      {/* TOP METRICS GRID (Merged Old & New) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Errands" value={errands.length} color="text-white" />
        <Metric label="Waitlist" value={waitlist.length} color="text-green-500" />
        <Metric label="Ref Rate" value={`${referralRate.toFixed(1)}%`} color="text-yellow-500" />
        <Metric label="Viral K" value={viralCoefficient.toFixed(2)} color="text-blue-400" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LIVE ERRAND STREAM */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest italic flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Errand Stream
          </h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-gray-500 bg-white/5">
                <tr><th className="p-4">Client</th><th className="p-4">Task</th><th className="p-4">Hub</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {errands.map((e) => (
                  <tr key={e.id} className="text-sm hover:bg-white/[0.02] transition-all">
                    <td className="p-4 font-bold">{e.client_name}</td>
                    <td className="p-4 text-gray-400">{e.title}</td>
                    <td className="p-4 text-xs font-mono uppercase text-gray-500">{e.pickup_location}</td>
                    <td className="p-4"><span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-black uppercase border border-green-500/20">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OLD ANALYTICS: REFERRAL LEADERBOARD */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-widest italic text-yellow-500">Referral Kings</h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 space-y-4">
            {leaderboard.map((l, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                <span className="text-gray-400 font-mono text-xs">{l.code}</span>
                <span className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-3 py-1 rounded-lg border border-yellow-500/20">{l.count} Refs</span>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-gray-600 text-xs italic text-center py-4">No viral growth recorded yet.</p>}
          </div>
          
          {/* LOCATION INSIGHT (Also from Old Admin) */}
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">Top Growth Hubs</h3>
            <div className="space-y-2">
               {Array.from(new Set(waitlist.map(u => u.location))).slice(0, 3).map(loc => (
                 <div key={loc} className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">{loc}</span>
                    <span className="text-white">{waitlist.filter(u => u.location === loc).length}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* RUNNER FLEET STATUS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest italic text-blue-400">Fleet Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {runners.map((r) => (
            <div key={r.id} className="bg-zinc-900 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-blue-500/30 transition-all">
              <div>
                <p className="font-bold">{r.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-mono">{r.location} • {r.transport_type}</p>
              </div>
              <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                 <span className="text-[9px] text-blue-400 font-black uppercase">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] shadow-xl shadow-black">
      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{label}</p>
      <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}