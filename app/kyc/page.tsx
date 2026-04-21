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
    <div className="p-6">
      <input
        placeholder="Full Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input placeholder="NIN" onChange={(e) => setNin(e.target.value)} />
      <button onClick={submitKyc}>Submit KYC</button>
    </div>
  );
}