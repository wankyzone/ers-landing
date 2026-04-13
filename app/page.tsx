"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

function generateCode(email: string) {
  return email.split("@")[0] + Math.floor(Math.random() * 9999);
}

function track(event: string) {
  console.log("ERS_EVENT:", event);
}

type User = {
  email: string;
  referral_code: string;
  role: string;
  location: string;
  created_at: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");

  const [users, setUsers] = useState<User[]>([]);

  // BROADCAST STATE
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // LOAD USERS (METRICS ENGINE)
  async function loadUsers() {
    const { data } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers((data as User[]) || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // METRICS
  const total = users.length;

  const clients = users.filter((u) => u.role === "client").length;
  const runners = users.filter((u) => u.role === "runner").length;

  const today = users.filter(
    (u) =>
      new Date(u.created_at).toDateString() === new Date().toDateString()
  ).length;

  const last7days = users.filter((u) => {
    const diff =
      (Date.now() - new Date(u.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // LEADERBOARD
  const leaderboard = useMemo(() => {
    const map: Record<string, number> = {};

    users.forEach((u) => {
      if (!u.referral_code) return;
      map[u.referral_code] = (map[u.referral_code] || 0) + 1;
    });

    return Object.entries(map)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [users]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) return;

    setLoading(true);

    const referral_code = generateCode(email);

    const { error } = await supabase.from("waitlist").insert([
      {
        email,
        referral_code,
        role,
        location,
      },
    ]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error(err);
    }

    setRefCode(referral_code);
    setSuccess(true);
    setEmail("");
    setLocation("");
    setLoading(false);

    track("signup_complete");

    loadUsers();
  }

  async function sendBroadcast() {
    if (!subject || !message) return;

    setSending(true);

    await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    setSending(false);
    alert("Broadcast sent");
  }

  const shareLink = `https://ers.wankysoftware.com?ref=${refCode}`;

  return (
    <main className="min-h-screen bg-black text-white p-6 space-y-16">

      {/* HERO */}
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-7xl font-black">
          ERS <span className="text-green-500">SYSTEM</span>
        </h1>
        <p className="text-gray-400 mt-4">
          Execution layer for Lagos errands
        </p>
      </section>

      {/* 📊 METRICS */}
      <section className="grid md:grid-cols-4 gap-4">
        <Metric label="Total Users" value={total} />
        <Metric label="Clients" value={clients} />
        <Metric label="Runners" value={runners} />
        <Metric label="Last 7 Days" value={last7days} />
      </section>

      {/* 📧 BROADCAST */}
      <section className="bg-gray-900 p-6 rounded-xl space-y-3">
        <h2 className="text-xl font-bold">Broadcast Engine</h2>

        <input
          className="w-full p-2 bg-black border border-gray-700"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          className="w-full p-2 bg-black border border-gray-700"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendBroadcast}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </section>

      {/* 🏆 LEADERBOARD */}
      <section className="bg-gray-900 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Referral Leaderboard</h2>

        {leaderboard.map((l) => (
          <div key={l.code} className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-green-400">{l.code}</span>
            <span>{l.count}</span>
          </div>
        ))}
      </section>

      {/* SIGNUP */}
      <section className="max-w-xl mx-auto text-center space-y-6">

        <h2 className="text-2xl font-bold">Join Waitlist</h2>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-3">

            <input
              className="w-full p-3 bg-gray-900 border border-gray-700"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <select
              className="w-full p-3 bg-gray-900 border border-gray-700"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="client">Client</option>
              <option value="runner">Runner</option>
            </select>

            <input
              className="w-full p-3 bg-gray-900 border border-gray-700"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <button className="bg-green-500 text-black px-4 py-2 w-full font-bold">
              {loading ? "Loading..." : "Join"}
            </button>

          </form>
        ) : (
          <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
            <p className="text-green-400 font-bold">You're in 🚀</p>
            <p className="text-sm mt-2">{refCode}</p>
            <a
              className="text-green-400 block mt-3"
              href={`https://wa.me/?text=Join ERS: ${shareLink}`}
            >
              Share
            </a>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl text-center">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl text-green-400 font-bold">{value}</p>
    </div>
  );
}