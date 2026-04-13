"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  email: string;
  referral_code: string;
  role: string;
  location: string;
  created_at: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function deleteUser(id: number) {
    const confirmDelete = confirm("Delete this user?");
    if (!confirmDelete) return;

    await supabase.from("waitlist").delete().eq("id", id);
    fetchUsers();
  }

  async function sendBroadcast() {
    if (!broadcastMsg) return alert("Enter a message");

    setSending(true);

    try {
      await fetch("/api/broadcast", {
        method: "POST",
        body: JSON.stringify({ message: broadcastMsg }),
      });

      alert("Broadcast sent 🚀");
      setBroadcastMsg("");
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast");
    }

    setSending(false);
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  // 🔐 PASSWORD GATE
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">ERS Admin</h1>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded bg-black border border-gray-700 mb-4"
          />

          <button
            onClick={() => {
              if (password === "ersadmin123") setAuthenticated(true);
              else alert("Wrong password");
            }}
            className="w-full bg-green-500 text-black font-bold py-3 rounded"
          >
            Access Dashboard
          </button>
        </div>
      </main>
    );
  }

  // 📊 METRICS
  const total = users.length;
  const runners = users.filter((u) => u.role === "runner").length;
  const clients = users.filter((u) => u.role === "client").length;
  const today = users.filter(
    (u) =>
      new Date(u.created_at).toDateString() ===
      new Date().toDateString()
  ).length;

  // 🏆 LEADERBOARD (simple version)
  const leaderboard = [...users]
    .sort((a, b) => b.referral_code.length - a.referral_code.length)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 space-y-10">

      <h1 className="text-3xl font-bold">ERS Admin Dashboard</h1>

      {/* METRICS */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Total Users</p>
          <h2 className="text-2xl text-green-500 font-bold">{total}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Joined Today</p>
          <h2 className="text-2xl text-green-500 font-bold">{today}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Runners</p>
          <h2 className="text-2xl text-green-500 font-bold">{runners}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Clients</p>
          <h2 className="text-2xl text-green-500 font-bold">{clients}</h2>
        </div>
      </div>

      {/* BROADCAST */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Broadcast Message</h2>

        <textarea
          placeholder="Send update to all users..."
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          className="w-full p-3 bg-black border border-gray-700 rounded mb-3"
        />

        <button
          onClick={sendBroadcast}
          disabled={sending}
          className="bg-green-500 text-black px-6 py-2 rounded font-bold"
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </div>

      {/* LEADERBOARD */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="font-bold mb-4">Top Referrals</h2>

        {leaderboard.map((user, i) => (
          <div key={user.id} className="flex justify-between border-b border-gray-800 py-2">
            <span>{i + 1}. {user.email}</span>
            <span className="text-green-400">{user.referral_code}</span>
          </div>
        ))}
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-800">
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-green-400">{user.role}</td>
                <td className="p-3">{user.location}</td>
                <td className="p-3 text-gray-500">
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(user.id)}
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