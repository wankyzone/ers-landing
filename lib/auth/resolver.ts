import { supabase } from "@/lib/supabase";

export async function resolveUserRoute() {
  const { data: sessionData } = await supabase.auth.getUser();

  const user = sessionData.user;

  if (!user) return "/login";

  const email = user.email;

  // 🔥 founder override
  if (email === "founder@wankysoftware.com") {
    return "/admin";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", email)
    .single();

  if (!profile?.role) return "/select-role";

  switch (profile.role) {
    case "admin":
      return "/admin";
    case "runner":
      return "/runner";
    case "client":
      return "/client";
    default:
      return "/select-role";
  }
}