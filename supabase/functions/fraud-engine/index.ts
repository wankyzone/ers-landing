// @ts-ignore
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { runner_id } = await req.json();

    // Simple fraud logic
    const { data: jobs } = await supabase
      .from("errands")
      .select("*")
      .eq("runner_id", runner_id);

    let riskScore = 0;

    if (jobs && jobs.length < 3) riskScore += 20;
    if (jobs?.some((j: any) => j.status === "cancelled")) riskScore += 30;

    await supabase.from("runner_risk_scores").insert({
      runner_id,
      risk_score: riskScore,
    });

    return new Response(JSON.stringify({ riskScore }), { status: 200 });
  } catch (e: any) { // ✅ FIX implicit any
    return new Response(e.message, { status: 500 });
  }
});