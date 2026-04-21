import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: errands } = await supabase
    .from("errands")
    .select("status, runner_id");

  if (!errands) {
    return new Response("No data");
  }

  const runnerMap: Record<string, any> = {};

  errands.forEach(e => {
    if (!e.runner_id) return;

    if (!runnerMap[e.runner_id]) {
      runnerMap[e.runner_id] = {
        total: 0,
        completed: 0,
        failed: 0,
      };
    }

    const r = runnerMap[e.runner_id];

    r.total++;

    if (e.status === "completed") r.completed++;
    if (e.status === "failed") r.failed++;
  });

  for (const runnerId in runnerMap) {
    const r = runnerMap[runnerId];

    let score = 0;

    if (r.failed >= 3) score += 40;
    if (r.completed / r.total < 0.5) score += 30;

    score = Math.min(score, 100);

    // update user (NOT profiles if you don't have it)
    await supabase
      .from("users")
      .update({ fraud_score: score })
      .eq("id", runnerId);

    if (score >= 70) {
      await supabase
        .from("users")
        .update({ status: "flagged" })
        .eq("id", runnerId);

      await supabase.from("admin_alerts").insert({
        type: "fraud_detected",
        message: `Runner ${runnerId} flagged (${score})`,
        severity: "high",
      });
    }
  }

  return new Response("Fraud analysis complete");
});

// <reference lib="deno.ns" />