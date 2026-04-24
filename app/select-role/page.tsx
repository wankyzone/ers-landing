"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { resolveUserRoute } from "@/lib/auth/resolver";

export default function SelectRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setRole = async (role: string) => {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) return;

    // ✅ FIRST update role
    await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    // ✅ THEN resolve route centrally
    const route = await resolveUserRoute();
    router.replace(route);
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