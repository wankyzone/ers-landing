import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export async function useOnboardingGuard() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return "NO_AUTH";

  const userId = userData.user.id;

  // ✅ Fetch profile with ALL needed fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, kyc_status")
    .eq("id", userId)
    .single();

  if (!profile) return "NO_PROFILE";

  // ✅ Admin bypass
  if (profile.role === "admin") return "ADMIN";

  // ✅ KYC check
  const { data: kyc } = await supabase
    .from("kyc_profiles")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (!kyc) return "NO_KYC";

  if (kyc.status !== "verified") return "PENDING_KYC";

  // ✅ Final approval check
  if (profile.kyc_status !== "approved") return "PENDING_KYC";

  return "OK";
}