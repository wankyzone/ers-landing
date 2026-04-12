"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  email: string;
  referral_code: string;
  created_at: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // FETCH USERS
  async function fetchUsers() {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
      setFilteredUsers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated]);

  // FILTER LOGIC
  useEffect(() => {
    let result = [...users];

    if (search) {
      result = result.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === "today") {
      const today = new Date().toDateString();
      result = result.filter(
        (u) => new Date(u.created_at).toDateString() === today
      );
    }

    if (filter === "7days") {
      const now = new Date();
      result = result.filter((u) => {
        const diff =
          (now.getTime() - new Date(u.created_at).getTime()) /
          (1000 * 60 * 60 * 24);
        return diff <= 7;
      });
    }

    setFilteredUsers(result);
  }, [search, filter, users]);

  // DELETE USER
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
      fetchUsers();
    }
  }

  // EXPORT CSV
  function exportCSV() {
    const rows = users.map((u) =>
      `${u.email},${u.referral_code},${u.created_at}`
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Email,Referral Code,Created At", ...rows].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "ers_waitlist.csv";
    link.click();
  }

  // METRICS
  const total = users.length;
  const today = users.filter(
    (u) =>
      new Date(u.created_at).toDateString() ===
      new Date().toDateString()
  ).length;

  const last7days = users.filter((u) => {
    const diff =
      (new Date().getTime() - new Date(u.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // 🔐 AUTH
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

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      
      <h1 className="text-3xl font-bold mb-8">ERS Admin V5</h1>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Total Users</p>
          <h2 className="text-2xl text-green-500 font-bold">{total}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Today</p>
          <h2 className="text-2xl text-green-500 font-bold">{today}</h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">Last 7 Days</p>
          <h2 className="text-2xl text-green-500 font-bold">{last7days}</h2>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded bg-gray-900 border border-gray-700"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded bg-gray-900 border border-gray-700"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
        </select>

        <button
          onClick={exportCSV}
          className="bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Referral</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-800">
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-green-400">
                  {user.referral_code}
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(user.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-400 hover:underline"
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