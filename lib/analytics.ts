import { supabase } from "@/lib/supabase";

export async function getAnalytics() {
  const { count: totalErrands } = await supabase
    .from("errands")
    .select("*", { count: "exact", head: true });

  return { totalErrands };
}