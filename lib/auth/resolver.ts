import { supabase } from "@/lib/supabase";

export async function resolveUserRoute() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return "/login";

  const user = session.user;

  // 🔥 Founder override
  if (user.email === "founder@wankysoftware.com") {
    return "/admin";
  }

  // 👇 THIS IS WHERE YOUR CODE GOES
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    console.log("⚠️ Creating profile for user");

    await supabase.from("profiles").insert({
      id: user.id,
      role: null,
    });

    return "/select-role";
  }

  // 👇 CONTINUE NORMAL FLOW
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