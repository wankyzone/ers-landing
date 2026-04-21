import { supabase } from "@/lib/supabase";

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return data.role as "client" | "runner";
}