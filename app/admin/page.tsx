"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setUsers(data || []);

    setLoading(false);
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user?")) return;

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", id);

    if (!error) {
      setUsers(users.filter((u) => u.id !== id));
    }
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  // 🔐 LOGIN
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
            Enter
          </button>
        </div>
      </main>
    );
  }

  // 📊 METRICS
  const totalUsers = users.length;
  const runners = users.filter((u) => u.role === "runner").length;
  const clients = users.filter((u) => u.role === "client").length;

  // 📈 GROUP BY DATE
  const growthMap: Record<string, number> = {};

  users.forEach((u) => {
    const date = new Date(u.created_at).toLocaleDateString();
    growthMap[date] = (growthMap[date] || 0) + 1;
  });

  const growthData = Object.keys(growthMap).map((date) => ({
    date,
    users: growthMap[date],
  }));

  // 🌍 LOCATION STATS
  const locationMap: Record<string, number> = {};

  users.forEach((u) => {
    if (!u.location) return;
    locationMap[u.location] = (locationMap[u.location] || 0) + 1;
  });

  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 📤 EXPORT CSV
  function exportCSV() {
    const csv = [
      ["Email", "Role", "Location", "Referral", "Created"],
      ...users.map((u) => [
        u.email,
        u.role,
        u.location,
        u.referral_code,
        u.created_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ers-users.csv";
    a.click();
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <h1 className="text-3xl font-bold mb-8">ERS Command Center</h1>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Total Users" value={totalUsers} />
        <Card title="Clients" value={clients} />
        <Card title="Runners" value={runners} />
      </div>

      {/* CHART */}
      <div className="bg-gray-900 p-6 rounded-xl mb-10">
        <h2 className="mb-4 text-lg font-semibold">Growth Trend</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={growthData}>
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOCATION */}
      <div className="bg-gray-900 p-6 rounded-xl mb-10">
        <h2 className="mb-4 text-lg font-semibold">Top Locations</h2>

        {topLocations.map(([loc, count]) => (
          <div key={loc} className="flex justify-between text-sm py-1">
            <span>{loc}</span>
            <span className="text-green-400">{count}</span>
          </div>
        ))}
      </div>

      {/* EXPORT */}
      <button
        onClick={exportCSV}
        className="mb-6 bg-green-500 px-4 py-2 rounded text-black font-bold"
      >
        Export CSV
      </button>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Location</th>
              <th className="p-3">Referral</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.location}</td>
                <td className="p-3 text-green-400">{u.referral_code}</td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-400 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

// SMALL CARD COMPONENT
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-green-500">{value}</h2>
    </div>
  );
}