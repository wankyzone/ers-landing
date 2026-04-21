"use client";

import { useRoleSync } from "@/hooks/useRoleSync";

export default function RoleSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useRoleSync();

  return <>{children}</>;
}