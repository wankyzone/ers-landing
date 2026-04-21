"use client";

export default function KYCPending() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-6 rounded-xl text-center">
        <h1 className="text-xl font-bold mb-2">KYC Submitted</h1>
        <p className="text-zinc-400">
          Your verification is under review. You’ll be notified once approved.
        </p>
      </div>
    </div>
  );
}