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
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // 🔐 AUTH CHECK
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);

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
    if (session?.user?.email === adminEmail) {
      fetchUsers();
    }
  }, [session]);

  // ❌ NOT LOGGED IN
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <button
          onClick={() =>
            supabase.auth.signInWithPassword({
              email: prompt("Email") || "",
              password: prompt("Password") || "",
            })
          }
          className="bg-green-500 px-6 py-3 rounded text-black font-bold"
        >
          Login as Admin
        </button>
      </main>
    );
  }

  // ❌ NOT ADMIN
  if (session.user.email !== adminEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Access Denied</p>
      </main>
    );
  }

  // 📊 METRICS
  const totalUsers = users.length;
  const runners = users.filter((u) => u.role === "runner").length;
  const clients = users.filter((u) => u.role === "client").length;

  // 📈 GROWTH
  const growthMap: Record<string, number> = {};
  users.forEach((u) => {
    const d = new Date(u.created_at).toLocaleDateString();
    growthMap[d] = (growthMap[d] || 0) + 1;
  });

  const growthData = Object.keys(growthMap).map((d) => ({
    date: d,
    users: growthMap[d],
  }));

  // 🏆 REFERRALS
  const referralMap: Record<string, number> = {};
  users.forEach((u) => {
    referralMap[u.referral_code] =
      (referralMap[u.referral_code] || 0) + 1;
  });

  const topReferrals = Object.entries(referralMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ERS Command Center</h1>

        <button
          onClick={() => supabase.auth.signOut()}
          className="text-red-400 text-sm"
        >
          Logout
        </button>
      </div>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card title="Total Users" value={totalUsers} />
        <Card title="Clients" value={clients} />
        <Card title="Runners" value={runners} />
      </div>

      {/* CHART */}
      <div className="bg-gray-900 p-6 rounded-xl mb-10">
        <h2 className="mb-4">Growth</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={growthData}>
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* REFERRAL LEADERBOARD */}
      <div className="bg-gray-900 p-6 rounded-xl mb-10">
        <h2 className="mb-4">Top Referrals</h2>

        {topReferrals.map(([code, count]) => (
          <div key={code} className="flex justify-between py-1">
            <span>{code}</span>
            <span className="text-green-400">{count}</span>
          </div>
        ))}
      </div>

      {/* LIVE FEED */}
      <div className="bg-gray-900 p-6 rounded-xl mb-10">
        <h2 className="mb-4">Recent Activity</h2>

        {users.slice(0, 5).map((u) => (
          <div key={u.id} className="text-sm text-gray-400 py-1">
            {u.email} joined ({u.role})
          </div>
        ))}
      </div>

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

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-green-500">{value}</h2>
    </div>
  );
}