"use client";

import { useAuthRole } from "@/hooks/useAuthRole";

export default function RoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, loading } = useAuthRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading system...
      </div>
    );
  }

  if (!role) {
    if (typeof window !== "undefined") {
      window.location.href = "/select-role";
    }
    return null;
  }

  return <>{children}</>;
}