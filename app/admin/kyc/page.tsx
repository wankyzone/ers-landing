"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  full_name: string;
  nin: string;
  kyc_status: string;
};

export default function AdminKYCPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH GUARD
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== "founder@wankysoftware.com") {
        window.location.href = "/";
      }
    };

    checkAdmin();
  }, []);

  // 📦 FETCH USERS
  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("kyc_status", "pending");

    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ⚙️ UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("profiles")
      .update({ kyc_status: status })
      .eq("id", id);

    fetchUsers();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">KYC Verification</h1>

      {loading && <p>Loading...</p>}

      {!loading && users.length === 0 && (
        <p>No pending KYC requests.</p>
      )}

      {users.map((user) => (
        <div key={user.id} className="bg-zinc-900 p-4 mb-4 rounded">
          <p><strong>Name:</strong> {user.full_name}</p>
          <p><strong>NIN:</strong> {user.nin}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => updateStatus(user.id, "approved")}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(user.id, "rejected")}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}