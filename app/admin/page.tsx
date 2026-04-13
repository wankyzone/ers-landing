"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  email: string;
  referral_code: string;
  referred_by: string | null;
  role: string;
  location: string;
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

    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);
    else console.error(error);

    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;

    await supabase.from("waitlist").delete().eq("id", id);
    fetchUsers();
  }

  async function sendBroadcast() {
    if (!subject || !message) return alert("Enter subject + message");

    setSending(true);

    await fetch("/api/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, message }),
    });

    setSending(false);
    alert("Broadcast sent 🚀");
    setSubject("");
    setMessage("");
  }

  // =========================
  // 📊 CORE METRICS
  // =========================
  const total = users.length;
  const clients = users.filter((u) => u.role === "client").length;
  const runners = users.filter((u) => u.role === "runner").length;

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

  const usersWithReferrals = Object.keys(referralMap).length;

  const referralRate =
    total > 0 ? (usersWithReferrals / total) * 100 : 0;

  const totalReferrals = Object.values(referralMap).reduce(
    (a, b) => a + b,
    0
  );

  const viralCoefficient =
    total > 0 ? totalReferrals / total : 0;

  const dropOffUsers =
    total - usersWithReferrals;

  // =========================
  // 🌍 LOCATION INSIGHT
  // =========================
  const topLocations = useMemo(() => {
    const map: Record<string, number> = {};

    users.forEach((u) => {
      if (!u.location) return;
      map[u.location] = (map[u.location] || 0) + 1;
    });

    return Object.entries(map)
      .map(([loc, count]) => ({ loc, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [users]);

  // =========================
  // 🔐 AUTH
  // =========================
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">ERS Admin V8</h1>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black border border-gray-700 mb-4"
          />

          <button
            onClick={() => {
              if (password === "ersadmin123") {
                setAuthenticated(true);
              } else {
                alert("Wrong password");
              }
            }}
            className="w-full bg-green-500 text-black font-bold py-3 rounded"
          >
            Access
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      <h1 className="text-3xl font-bold">ERS Growth Dashboard</h1>

      {/* 📊 METRICS */}
      <div className="grid md:grid-cols-5 gap-6">
        <Metric label="Total Users" value={total} />
        <Metric label="Today" value={today} />
        <Metric label="7 Days" value={last7days} />
        <Metric label="Clients" value={clients} />
        <Metric label="Runners" value={runners} />
      </div>

      {/* 🚀 GROWTH INTEL */}
      <div className="grid md:grid-cols-4 gap-6">
        <Metric label="Referral Rate (%)" value={Number(referralRate.toFixed(1))} />
        <Metric label="Viral Coefficient" value={Number(viralCoefficient.toFixed(2))} />
        <Metric label="Total Referrals" value={totalReferrals} />
        <Metric label="Drop-off Users" value={dropOffUsers} />
      </div>

      {/* 📧 BROADCAST */}
      <div className="bg-gray-900 p-6 rounded-xl space-y-4">
        <h2 className="font-bold">Broadcast</h2>

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded"
        />

        <button
          onClick={sendBroadcast}
          className="bg-green-500 px-6 py-2 rounded text-black font-bold"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* 🏆 LEADERBOARD */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Top Referrals</h2>

        {leaderboard.map((l, i) => (
          <div key={l.code} className="flex justify-between py-2 border-b border-gray-800">
            <span>#{i + 1} {l.code}</span>
            <span className="text-green-400">{l.count}</span>
          </div>
        ))}
      </div>

      {/* 🌍 LOCATIONS */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Top Locations</h2>

        {topLocations.map((l, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-gray-800">
            <span>{l.loc}</span>
            <span className="text-green-400">{l.count}</span>
          </div>
        ))}
      </div>

      {/* 👥 USERS */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Location</th>
              <th className="p-3">Ref By</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-green-400">{u.role}</td>
                <td className="p-3">{u.location}</td>
                <td className="p-3">{u.referred_by || "-"}</td>
                <td className="p-3 text-gray-500">
                  {new Date(u.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl text-center">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl text-green-400 font-bold">{value}</p>
    </div>
  );
}