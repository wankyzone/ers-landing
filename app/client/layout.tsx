"use client";

// Change this from '@/components/guards/ClientGuard'
import ClientGuard from "@/app/components/ClientGuard"; 

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientGuard>{children}</ClientGuard>;
}