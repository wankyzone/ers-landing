import { supabase } from "@/lib/supabase";

export async function resolveUserRoute() {
  // 🔥 wait for session stability
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return "/login";
  }

  const user = session.user;
  const email = user.email;

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