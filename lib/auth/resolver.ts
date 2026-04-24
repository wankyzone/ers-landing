import { supabase } from "@/lib/supabase";

export async function resolveUserRoute() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return "/login";

  const user = session.user;
  const email = user.email?.toLowerCase();

  // 🔥 Founder override (hard gate)
  if (email === "founder@wankysoftware.com") {
    return "/admin";
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error:", error);
    return "/login";
  }

  if (!profile) {
    await supabase.from("profiles").upsert({
      id: user.id,
      role: null,
    });

    return "/select-role";
  }

  if (!profile.role) return "/select-role";

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