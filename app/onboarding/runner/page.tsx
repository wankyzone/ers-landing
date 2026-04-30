"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RunnerOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    nin: "",
    vehicle: "bike"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        nin: formData.nin,
        vehicle_type: formData.vehicle,
      })
      .eq("id", user?.id);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/runner/pending-verification");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-black italic mb-2">RUNNER IDENTITY</h2>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">
          Submit KYC details to begin execution.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Full Legal Name</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-green-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">WhatsApp/Phone Number</label>
            <input 
              required
              type="tel"
              placeholder="+234..."
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-green-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">NIN (National Identity Number)</label>
            <input 
              required
              maxLength={11}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-green-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, nin: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all uppercase"
          >
            {loading ? "Registering..." : "Submit for Verification"}
          </button>
        </form>
      </div>
    </main>
  );
}