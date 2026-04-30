import { supabase } from "@/lib/supabase";

export const resolveUserRoute = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/";

  // Check the profiles table specifically
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, phone, nin")
    .eq("id", user.id)
    .single();

  // If no profile or no role, send to selection
  if (!profile || !profile.role) return "/select-role";

  // Onboarding Gates
  if (profile.role === "runner" && (!profile.phone || !profile.nin)) {
    return "/onboarding/runner";
  }
  
  if (profile.role === "client" && !profile.phone) {
    return "/onboarding/client";
  }

  return `/${profile.role}`;
};