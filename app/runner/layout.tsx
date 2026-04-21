"use client";

import RunnerGuard from "@/components/guards/RunnerGuard";

export default function RunnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RunnerGuard>{children}</RunnerGuard>;
}