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
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function fetchUsers() {
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

  useEffect(() => {
    if (authenticated) {
      fetchUsers();
    }
  }, [authenticated]);

  // 🔐 SIMPLE PASSWORD GATE (v1)
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
      
      <h1 className="text-3xl font-bold mb-6">ERS Dashboard</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <p className="mb-4 text-gray-400">
            Total Users: <span className="text-green-500">{users.length}</span>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Referral Code</th>
                  <th className="p-3 text-left">Joined</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 text-green-400">
                      {user.referral_code}
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}