"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRoleSync() {
  useEffect(() => {
    const channel = supabase
      .channel("user-role-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
        },
        () => {
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}