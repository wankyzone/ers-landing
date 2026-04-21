"use client";

import ClientGuard from "@/components/guards/ClientGuard";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientGuard>{children}</ClientGuard>;
}