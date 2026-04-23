"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function SelectRolePage() {
  useAuthRedirect();

  return (
    <div className="p-6 text-white">
      Loading role...
    </div>
  );
}