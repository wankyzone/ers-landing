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

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  async function deleteUser(id: number) {
    const confirmDelete = confirm("Delete this user?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Delete failed");
    } else {
      setUsers(users.filter((u) => u.id !== id));
    }
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  // 🔐 PASSWORD GATE
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">ERS Admin Access</h1>

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
            Access Dashboard
          </button>
        </div>
      </main>
    );
  }

  // 📊 METRICS
  const totalUsers = users.length;
  const runners = users.filter((u) => u.role === "runner").length;
  const clients = users.filter((u) => u.role === "client").length;

  const today = new Date().toDateString();
  const todayUsers = users.filter(
    (u) => new Date(u.created_at).toDateString() === today
  ).length;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">

      <h1 className="text-3xl font-bold mb-8">ERS Dashboard</h1>

      {/* 📊 METRIC CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        
        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Total Users</p>
          <h2 className="text-2xl font-bold text-green-500">{totalUsers}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Clients</p>
          <h2 className="text-2xl font-bold">{clients}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Runners</p>
          <h2 className="text-2xl font-bold">{runners}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400 text-sm">Joined Today</p>
          <h2 className="text-2xl font-bold">{todayUsers}</h2>
        </div>

      </div>

      {/* 📋 USERS TABLE */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-800 text-sm">
            
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Referral</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-800">

                  <td className="p-3">{user.email}</td>

                  <td className="p-3 capitalize">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === "runner"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="p-3 text-gray-400">
                    {user.location || "-"}
                  </td>

                  <td className="p-3 text-green-400">
                    {user.referral_code}
                  </td>

                  <td className="p-3 text-gray-500">
                    {new Date(user.created_at).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

    </main>
  );
}