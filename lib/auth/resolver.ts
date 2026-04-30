import { supabase } from "@/lib/supabase";

export const resolveUserRoute = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.role) return "/select-role";

  if (profile.role === "admin") return "/admin";
  if (profile.role === "runner") return "/runner";
  if (profile.role === "client") return "/client";

  return "/";
};