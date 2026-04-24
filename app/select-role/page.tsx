"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: string) => {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      router.replace("/login");
      return;
    }

    // ✅ UPDATE ROLE FIRST
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    if (error) {
      console.error("Role update error:", error);
      setLoading(false);
      return;
    }

    console.log("ROLE SET:", role);

    // 🔥 THEN REDIRECT CLEANLY
    if (role === "runner") {
      router.replace("/runner");
    } else {
      router.replace("/client");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl mb-4">Select Your Role</h1>

      <button
        onClick={() => setRole("runner")}
        className="bg-green-600 px-4 py-2 mr-2 rounded"
        disabled={loading}
      >
        Runner
      </button>

      <button
        onClick={() => setRole("client")}
        className="bg-blue-600 px-4 py-2 rounded"
        disabled={loading}
      >
        Client
      </button>
    </div>
  );
}