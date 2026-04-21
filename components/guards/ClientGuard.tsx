"use client";

import { useAuthRole } from "@/hooks/useAuthRole";

export default function ClientGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuthRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading client workspace...
      </div>
    );
  }

  if (role !== "client") {
    if (typeof window !== "undefined") {
      window.location.href = `/${role || ""}`;
    }
    return null;
  }

  return <>{children}</>;
}