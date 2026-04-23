"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // ✅ FIXED
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";

type User = {
  id: string;
  email: string;
  role: string;
  status: string;
  trust_score: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const status = await useOnboardingGuard();

      if (status === "NO_AUTH") return router.push("/login");
      if (status === "NO_KYC") return router.push("/kyc"); // ✅ FIXED
      if (status === "PENDING_KYC") return router.push("/kyc/pending");

      // 🔐 block non-admins
      if (status !== "ADMIN") return router.push("/");
    };

    check();
  }, []);

  async function fetchUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (!error) setUsers(data || []);

    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  async function updateUser(userId: string, updates: Partial<User>) {
    await fetch("/api/admin/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, ...updates }),
    });

    fetchUsers();
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Control Center</h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border p-4 rounded-lg flex flex-col gap-2"
          >
            <p>{user.email}</p>
            <p>Role: {user.role}</p>
            <p>Status: {user.status}</p>
            <p>Trust: {user.trust_score}</p>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  updateUser(user.id, { status: "suspended" })
                }
                className="bg-red-500 px-3 py-1 rounded"
              >
                Suspend
              </button>

              <button
                onClick={() =>
                  updateUser(user.id, { status: "active" })
                }
                className="bg-green-500 px-3 py-1 rounded"
              >
                Activate
              </button>

              <button
                onClick={() =>
                  updateUser(user.id, { trust_score: 20 })
                }
                className="bg-yellow-500 px-3 py-1 rounded"
              >
                Low Trust
              </button>

              <button
                onClick={() =>
                  updateUser(user.id, { role: "admin" })
                }
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Make Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}