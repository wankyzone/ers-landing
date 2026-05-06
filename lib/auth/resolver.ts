import { supabase } from "@/lib/supabase";
import { routeForRole } from "./routeDecision";

export const resolveUserRoute = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/select-role";

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!profile || !profile.role) return "/select-role";

  return routeForRole(profile.role);
};
