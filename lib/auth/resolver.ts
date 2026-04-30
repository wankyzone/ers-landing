import { supabase } from "@/lib/supabase";

export async function resolveUserRoute() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return "/login";

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return "/select-role";

  // 🔥 ADMIN BYPASS
  if (profile.role === "admin") {
    return "/admin";
  }

  // 🔥 NO ROLE
  if (!profile.role) {
    return "/select-role";
  }

  // 🔥 OPTIONAL: TEMPORARILY DISABLE KYC BLOCKING
  // (you can re-enable later)
  /*
  if (profile.kyc_status !== "verified") {
    return "/kyc";
  }
  */

  // 🔥 NORMAL FLOW
  if (profile.role === "runner") return "/runner";
  if (profile.role === "client") return "/client";

  return "/";
}