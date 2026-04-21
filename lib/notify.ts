// /lib/notify.ts
import { supabase } from "@/lib/supabase";

export async function notifyUser({
  user_id,
  title,
  message,
  type = "system",
}: {
  user_id: string;
  title: string;
  message: string;
  type?: string;
}) {
  await supabase.from("notifications").insert({
    user_id,
    title,
    message,
    type,
  });
}