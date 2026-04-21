"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function KYCPage() {
  const [name, setName] = useState("");
  const [nin, setNin] = useState("");

  const submitKyc = async () => {
    const { data } = await supabase.auth.getUser();

    await supabase.from("kyc_profiles").insert({
      user_id: data.user?.id,
      full_name: name,
      nin,
      status: "pending",
    });

    window.location.href = "/kyc/pending";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-lg">
        <h1 className="text-xl font-bold mb-4">Complete Your KYC</h1>

        <input
          className="w-full p-2 mb-3 bg-black border border-zinc-700 rounded"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
          placeholder="NIN"
          onChange={(e) => setNin(e.target.value)}
        />

        <button
          onClick={submitKyc}
          className="w-full bg-green-600 py-2 rounded font-semibold"
        >
          Submit KYC
        </button>
      </div>
    </div>
  );
}