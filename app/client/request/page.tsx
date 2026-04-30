"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import PaystackPop from "@paystack/inline-js";

export default function RequestErrand() {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    description: "",
    pickup: "",
    dropoff: "",
    amount: "" // In Naira
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const amountInKobo = Number(details.amount) * 100;

    // 1. Initialize Errand in DB (Status: pending)
    const { data: errand, error: errandErr } = await supabase
      .from("errands")
      .insert({
        client_id: user?.id,
        description: details.description,
        pickup_location: details.pickup,
        dropoff_location: details.dropoff,
        amount_kobo: amountInKobo,
        status: "pending"
      })
      .select()
      .single();

    if (errandErr) {
      alert("System Error: Could not initialize errand.");
      setLoading(false);
      return;
    }

    // 2. Trigger Paystack
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "", // Add to your .env
      email: user?.email || "",
      amount: amountInKobo,
      currency: "NGN",
      onSuccess: async (transaction: any) => {
        // 3. Update Errand status to paid_escrow
        await supabase
          .from("errands")
          .update({ 
            status: "paid_escrow", 
            paystack_ref: transaction.reference 
          })
          .eq("id", errand.id);
        
        alert("Payment Successful. Errand is now live!");
        window.location.href = "/client/dashboard";
      },
      onCancel: () => {
        setLoading(false);
        alert("Payment cancelled.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <form onSubmit={handlePayment} className="max-w-md w-full space-y-6 mt-10">
        <h2 className="text-3xl font-black italic">NEW ERRAND</h2>
        
        <textarea 
          placeholder="What needs to be done?"
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 h-32"
          onChange={(e) => setDetails({...details, description: e.target.value})}
          required
        />

        <input 
          placeholder="Pickup Location (e.g. Lekki Phase 1)"
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl"
          onChange={(e) => setDetails({...details, pickup: e.target.value})}
          required
        />

        <input 
          placeholder="Dropoff Location (e.g. Victoria Island)"
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl"
          onChange={(e) => setDetails({...details, dropoff: e.target.value})}
          required
        />

        <div className="relative">
          <span className="absolute left-4 top-4 text-gray-500 font-bold">₦</span>
          <input 
            type="number"
            placeholder="Execution Fee"
            className="w-full bg-white/5 border border-white/10 p-4 pl-10 rounded-xl font-bold text-green-500"
            onChange={(e) => setDetails({...details, amount: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-green-500/20"
        >
          {loading ? "Processing..." : "Pay & Deploy Errand"}
        </button>
      </form>
    </main>
  );
}