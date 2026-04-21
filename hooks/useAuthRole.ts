"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/getUserRole";

export function useAuthRole() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"client" | "runner" | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userRole = await getUserRole(session.user.id);

      setRole(userRole);
      setLoading(false);
    };

    init();
  }, []);

  return { role, loading };
}