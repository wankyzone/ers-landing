"use client";

import { useState, useEffect } from "react"; // ✅ FIX
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (!error) {
      setStep("otp");
      setTimer(60); // ✅ moved here
    }

    setLoading(false);
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    await sendOtp();
  };

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const verifyOtp = async () => {
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (!error) {
      window.location.href = "/";
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-xl">
        <h1 className="text-xl font-bold mb-4">Login to ERS</h1>

        {step === "phone" ? (
          <>
            <input
              className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
              placeholder="+2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-green-600 py-2 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full p-2 mb-3 bg-black border border-zinc-700 rounded"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-600 py-2 rounded mb-2"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={resendOtp}
              disabled={timer > 0}
              className="w-full text-sm text-zinc-400"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}