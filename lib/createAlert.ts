// /lib/createAlert.ts

import { supabase } from "@/lib/supabase";

export async function createAlert({
  type,
  message,
  severity = "medium",
  metadata = {},
}: {
  type: string;
  message: string;
  severity?: string;
  metadata?: any;
}) {
  await supabase.from("admin_alerts").insert({
    type,
    message,
    severity,
    metadata,
  });
}