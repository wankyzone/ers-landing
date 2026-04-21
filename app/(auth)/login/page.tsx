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

    if (!error) {
      window.location.href = "/"; // redirect
    }
  };

  return (
    <div className="p-6">
      {step === "phone" ? (
        <>
          <input
            placeholder="+234..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}
    </div>
  );
}