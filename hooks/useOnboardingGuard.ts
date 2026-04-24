import { supabase } from "@/lib/supabase";

export async function useOnboardingGuard() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    console.log("GUARD: NO AUTH");
    return "NO_AUTH";
  }

  const user = userData.user;
  const email = user.email?.toLowerCase();

  // 🔥 HARD ADMIN OVERRIDE (TOP PRIORITY)
  if (email === "founder@wankysoftware.com") {
    console.log("GUARD: ADMIN BYPASS");
    return "ADMIN";
  }

  const userId = user.id;

  // 🔍 PROFILE
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, kyc_status")
    .eq("id", userId)
    .maybeSingle();

  console.log("GUARD PROFILE:", profile);

  // ✅ AUTO-CREATE PROFILE (CRITICAL FIX)
  if (!profile) {
    console.log("GUARD: Creating profile");

    await supabase.from("profiles").upsert({
      id: userId,
      role: null,
      kyc_status: "pending",
    });

    return "NO_PROFILE";
  }

  // ✅ ROLE NOT SET → go select role
  if (!profile.role) {
    console.log("GUARD: NO ROLE");
    return "NO_PROFILE";
  }

  // 🔥 ADMIN ROLE
  if (profile.role === "admin") {
    console.log("GUARD: ADMIN ROLE");
    return "ADMIN";
  }

  // 🔍 KYC CHECK
  const { data: kyc } = await supabase
    .from("kyc_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  console.log("GUARD KYC:", kyc);

  if (!kyc) return "NO_KYC";

  if (kyc.status !== "verified") return "PENDING_KYC";

  if (profile.kyc_status !== "approved") return "PENDING_KYC";

  return "OK";
}