"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Errand = {
  id: string;
  client_name: string;
  client_phone: string;
  title: string;
  status: string;
  pickup_location: string;
  created_at: string;
};

type Runner = {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  transport_type: string;
  status: string;
  created_at: string;
};

type WaitlistUser = {
  id: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  role: string;
  location: string;
  created_at: string;
};

export default function AdminPage() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // 📧 Broadcast State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // =========================
  // 📦 FETCH DATA
  // =========================
  async function fetchAllData() {
    setLoading(true);

    const [eRes, rRes, wRes] = await Promise.all([
      supabase.from("errands").select("*").order("created_at", { ascending: false }),
      supabase.from("runners").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
    ]);

    if (!eRes.error) setErrands(eRes.data || []);
    if (!rRes.error) setRunners(rRes.data || []);
    if (!wRes.error) setWaitlist(wRes.data || []);

    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchAllData();
  }, [authenticated]);

  // =========================
  // 📊 METRICS
  // =========================
  const totalUsers = waitlist.length;
  const totalErrands = errands.length;
  const totalRunners = runners.length;

  const todayUsers = waitlist.filter(
    (u) => new Date(u.created_at).toDateString() === new Date().toDateString()
  ).length;

  // =========================
  // 🧠 REFERRAL ENGINE
  // =========================
  const referralMap = useMemo(() => {
    const map: Record<string, number> = {};
    waitlist.forEach((u) => {
      if (u.referred_by) {
        map[u.referred_by] = (map[u.referred_by] || 0) + 1;
      }
    });
    return map;
  }, [waitlist]);

  const leaderboard = Object.entries(referralMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const referralRate =
    totalUsers > 0
      ? (Object.keys(referralMap).length / totalUsers) * 100
      : 0;

  // =========================
  // 📧 BROADCAST (FIXED)
  // =========================
  async function sendBroadcast() {
    if (!message) return alert("Enter a message");

    setSending(true);

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject || "ERS Update",
          message,
        }),
      });

      const data = await res.json();
      console.log("📡 Broadcast response:", data);

      if (!res.ok) throw new Error(data.error || "Failed");

      alert("Broadcast sent 🚀");
      setMessage("");
      setSubject("");
    } catch (err: any) {
      console.error("❌ Broadcast error:", err);
      alert("Error: " + err.message);
    }

    setSending(false);
  }

  // =========================
  // ❌ DELETE USER
  // =========================
  async function deleteUser(id: string) {
    if (!confirm("Delete user?")) return;

    await supabase.from("waitlist").delete().eq("id", id);
    fetchAllData();
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">ERS Admin</h1>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black border border-gray-700 mb-4"
          />

          <button
            onClick={() =>
              password === "ersadmin123"
                ? setAuthenticated(true)
                : alert("Wrong password")
            }
            className="w-full bg-green-500 text-black font-bold py-3 rounded"
          >
            Enter Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      <h1 className="text-3xl font-bold">ERS Command Center</h1>

      {/* 📊 METRICS */}
      <div className="grid md:grid-cols-4 gap-6">
        <Metric label="Users" value={totalUsers} />
        <Metric label="Errands" value={totalErrands} />
        <Metric label="Runners" value={totalRunners} />
        <Metric label="Today" value={todayUsers} />
      </div>

      {/* 📧 BROADCAST */}
      <div className="bg-gray-900 p-6 rounded-xl space-y-3">
        <h2 className="font-bold">Broadcast Engine</h2>

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 bg-black border border-gray-700"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 bg-black border border-gray-700"
        />

        <button
          onClick={sendBroadcast}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </div>

      {/* 🏆 LEADERBOARD */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Referral Leaderboard</h2>

        {leaderboard.map((l) => (
          <div key={l.code} className="flex justify-between border-b border-gray-800 py-2">
            <span className="text-green-400">{l.code}</span>
            <span>{l.count}</span>
          </div>
        ))}

        <p className="text-gray-500 text-sm mt-3">
          Referral Rate: {referralRate.toFixed(1)}%
        </p>
      </div>

      {/* 📦 ERRANDS */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Errands</h2>

        {errands.map((e) => (
          <div key={e.id} className="border-b border-gray-800 py-2">
            <p>{e.client_name} — {e.title}</p>
            <p className="text-gray-500 text-sm">{e.pickup_location}</p>
          </div>
        ))}
      </div>

      {/* 👥 USERS */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Referred By</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {waitlist.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-green-400">{u.referred_by || "-"}</td>
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
    <div className="bg-gray-900 p-6 rounded-xl">
      <p className="text-gray-400">{label}</p>
      <h2 className="text-2xl text-green-500 font-bold">{value}</h2>
    </div>
  );
}