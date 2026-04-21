"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const sendOtp = async () => {
    await supabase.auth.signInWithOtp({ phone });
    setStep("otp");
  };

  const verifyOtp = async () => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (!error) window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="text-xl font-bold mb-4">Login to ERS</h1>

        {step === "phone" ? (
          <>
            <input
              className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={sendOtp}
              className="w-full bg-green-600 py-2 rounded"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 py-2 rounded"
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}