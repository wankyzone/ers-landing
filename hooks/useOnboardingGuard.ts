import { supabase } from "@/lib/supabase";

export async function useOnboardingGuard() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return "NO_AUTH";

  const email = userData.user.email?.toLowerCase();

  if (email === "founder@wankysoftware.com") {
    return "ADMIN";
  }

  const userId = userData.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, kyc_status")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return "NO_PROFILE";

  // ✅ ADMIN BYPASS FIRST
  if (profile.role === "admin") return "ADMIN";

  const { data: kyc } = await supabase
    .from("kyc_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!kyc) return "NO_KYC";

  if (kyc.status !== "verified") return "PENDING_KYC";

  if (profile.kyc_status !== "approved") return "PENDING_KYC";

  return "OK";
}