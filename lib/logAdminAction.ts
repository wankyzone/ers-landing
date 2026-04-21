// /lib/logAdminAction.ts
import { supabase } from "@/lib/supabase";

export async function logAdminAction({
  action,
  target_type,
  target_id,
  metadata = {},
}: {
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: any;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action,
    target_type,
    target_id,
    metadata,
  });
}