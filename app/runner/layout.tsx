"use client";

// Points to root/components/guard/RunnerGuard.tsx
import RunnerGuard from "@/components/guards/RunnerGuard"; 

export default function RunnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RunnerGuard>{children}</RunnerGuard>;
}