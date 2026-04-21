import { supabase } from "@/lib/supabase";

export async function useOnboardingGuard() {
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) return "NO_AUTH";

  // ✅ check role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.user.id)
    .single();

  if (profile?.role === "admin") return "OK";

  const { data: kyc } = await supabase
    .from("kyc_profiles")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  if (!kyc) return "NO_KYC";
  if (kyc.status !== "verified") return "PENDING_KYC";

  return "OK";
}