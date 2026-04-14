"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

// Updated id to string to match UUID format in your Supabase screenshot
type User = {
  id: string; 
  email: string;
  referral_code: string;
  referred_by: string | null;
  role: string | null;
  location: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function fetchUsers() {
    setLoading(true);

    // Fetching all columns and ordering by newest first
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setUsers(data || []);
    } else {
      console.error("Supabase Fetch Error:", error.message);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;

    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchUsers();
    }
  }

  async function sendBroadcast() {
    if (!subject || !message) return alert("Enter subject + message");

    setSending(true);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        alert("Broadcast sent 🚀");
        setSubject("");
        setMessage("");
      } else {
        alert("Failed to send broadcast");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  // =========================
  // 📊 CORE METRICS (Improved for Null/Case Safety)
  // =========================
  const total = users.length;
  
  // Updated to handle lowercase 'client' from your screenshot
  const clients = users.filter((u) => u.role?.toLowerCase() === "client").length;
  const runners = users.filter((u) => u.role?.toLowerCase() === "runner").length;

  const today = users.filter(
    (u) =>
      new Date(u.created_at).toDateString() ===
      new Date().toDateString()
  ).length;

  const last7days = users.filter((u) => {
    const diff =
      (Date.now() - new Date(u.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // =========================
  // 🧠 REFERRAL ENGINE
  // =========================
  const referralMap = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      if (!u.referred_by) return;
      map[u.referred_by] = (map[u.referred_by] || 0) + 1;
    });
    return map;
  }, [users]);

  const leaderboard = Object.entries(referralMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalReferrals = Object.values(referralMap).reduce((a, b) => a + b, 0);
  const referralRate = total > 0 ? (Object.keys(referralMap).length / total) * 100 : 0;
  const viralCoefficient = total > 0 ? totalReferrals / total : 0;

  // =========================
  // 🌍 LOCATION INSIGHT
  // =========================
  const topLocations = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      const loc = u.location || "Unknown";
      map[loc] = (map[loc] || 0) + 1;
    });
    return Object.entries(map)
      .map(([loc, count]) => ({ loc, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [users]);

  // =========================
  // 🔑 AUTH
  // =========================
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm text-center border border-gray-800">
          <h1 className="text-xl font-bold mb-4">ERS Admin Panel</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password === "ersadmin123" && setAuthenticated(true)}
            className="w-full px-4 py-3 rounded bg-black border border-gray-700 mb-4 focus:border-green-500 outline-none"
          />
          <button
            onClick={() => password === "ersadmin123" ? setAuthenticated(true) : alert("Wrong password")}
            className="w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition"
          >
            Access Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 md:px-10 py-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">ERS Growth Dashboard</h1>
        <button onClick={fetchUsers} className="text-sm bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* 📊 METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Metric label="Total Users" value={total} />
        <Metric label="Joined Today" value={today} />
        <Metric label="Last 7 Days" value={last7days} />
        <Metric label="Clients" value={clients} />
        <Metric label="Runners" value={runners} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 🚀 GROWTH INTEL */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl space-y-6">
           <h2 className="font-bold text-lg">Viral Metrics</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs uppercase">Referral Rate</p>
                <p className="text-xl font-bold text-green-400">{referralRate.toFixed(1)}%</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs uppercase">Viral K-Factor</p>
                <p className="text-xl font-bold text-green-400">{viralCoefficient.toFixed(2)}</p>
              </div>
           </div>
           
           <h2 className="font-bold text-lg pt-4">Top Lagos Hubs</h2>
           <div className="space-y-2">
            {topLocations.map((l, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-800/50 last:border-0">
                <span className="text-gray-300">{l.loc}</span>
                <span className="font-mono text-green-400">{l.count}</span>
              </div>
            ))}
           </div>
        </div>

        {/* 📧 BROADCAST */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-lg">Send Network Broadcast</h2>
          <input
            placeholder="Subject Line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 bg-black border border-gray-800 rounded-xl focus:border-green-500 outline-none"
          />
          <textarea
            placeholder="Write your update to all users..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 bg-black border border-gray-800 rounded-xl h-32 focus:border-green-500 outline-none"
          />
          <button
            onClick={sendBroadcast}
            disabled={sending}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 px-6 py-3 rounded-xl text-black font-bold transition"
          >
            {sending ? "Processing..." : "Dispatch Broadcast 🚀"}
          </button>
        </div>
      </div>

      {/* 👥 DETAILED USER LOG */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <h2 className="font-bold">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 bg-black/20">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-medium">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.role === 'runner' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                      {u.role || "client"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{u.location || "Lagos"}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-red-900 hover:text-red-500 transition text-xs font-bold"
                    >
                      REMOVE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-10 text-center text-gray-500">No users found in waitlist.</div>
          )}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl text-center">
      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl text-white font-bold">{value}</p>
    </div>
  );
}