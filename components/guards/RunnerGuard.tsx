"use client";

import { useAuthRole } from "@/hooks/useAuthRole";

export default function RunnerGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuthRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading runner workspace...
      </div>
    );
  }

  if (role !== "runner") {
    if (typeof window !== "undefined") {
      window.location.href = `/${role || ""}`;
    }
    return null;
  }

  return <>{children}</>;
}