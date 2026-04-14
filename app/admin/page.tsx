"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string;
  client_name: string;
  client_phone: string;
  title: string;
  status: string;
  pickup_location: string;
  created_at: string;
  type: 'errand';
};

type Runner = {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  transport_type: string;
  status: string;
  created_at: string;
  type: 'runner';
};

export default function AdminPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function fetchData() {
    setLoading(true);
    
    // 1. Fetch Errands (Clients)
    const { data: errandsData, error: errandsError } = await supabase
      .from("errands")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fetch Runners
    const { data: runnersData, error: runnersError } = await supabase
      .from("runners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!errandsError) setErrands(errandsData || []);
    if (!runnersError) setRunners(runnersData || []);
    
    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-sm text-center border border-white/10">
          <h1 className="text-xl font-bold mb-4 uppercase tracking-tighter">ERS Internal Access</h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password === "ersadmin123" && setAuthenticated(true)}
            className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 mb-4 focus:border-green-500 outline-none text-center"
          />
          <button
            onClick={() => password === "ersadmin123" ? setAuthenticated(true) : alert("Access Denied")}
            className="w-full bg-green-500 text-black font-black py-3 rounded-xl hover:bg-green-400 transition uppercase"
          >
            Login to System
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">System <span className="text-green-500">Overview</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-mono">Real-time logistics monitoring</p>
        </div>
        <button onClick={fetchData} className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-white/10">
          {loading ? "Syncing..." : "Refresh Logs"}
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem]">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Active Fleet</p>
          <p className="text-5xl font-black mt-2 text-green-500">{runners.length}</p>
          <p className="text-[10px] text-gray-600 mt-2 uppercase">Verified Runners in Lagos</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem]">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Errand Requests</p>
          <p className="text-5xl font-black mt-2">{errands.length}</p>
          <p className="text-[10px] text-gray-600 mt-2 uppercase">Total Client Submissions</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem]">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Pending Review</p>
          <p className="text-5xl font-black mt-2 text-yellow-500">
            {errands.filter(e => e.status === 'pending_review').length}
          </p>
          <p className="text-[10px] text-gray-600 mt-2 uppercase">Requires Attention</p>
        </div>
      </div>

      {/* ERRANDS TABLE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Errand Stream
        </h2>
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-500 border-b border-white/5">
                <th className="p-6">Client</th>
                <th className="p-6">Contact</th>
                <th className="p-6">Task</th>
                <th className="p-6">Location</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {errands.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <td className="p-6 font-bold">{e.client_name}</td>
                  <td className="p-6 font-mono text-xs text-gray-400">{e.client_phone}</td>
                  <td className="p-6 text-sm">{e.title}</td>
                  <td className="p-6 text-xs text-gray-400 uppercase">{e.pickup_location}</td>
                  <td className="p-6">
                    <span className="bg-green-500/10 text-green-500 text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RUNNERS TABLE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest">Runner Fleet</h2>
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-500 border-b border-white/5">
                <th className="p-6">Runner Name</th>
                <th className="p-6">Phone</th>
                <th className="p-6">Hub</th>
                <th className="p-6">Transport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {runners.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-6 font-bold">{r.full_name}</td>
                  <td className="p-6 font-mono text-xs text-gray-400">{r.phone}</td>
                  <td className="p-6 text-xs text-gray-400 uppercase">{r.location}</td>
                  <td className="p-6">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                      {r.transport_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}