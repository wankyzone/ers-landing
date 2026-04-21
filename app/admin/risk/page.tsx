const { data } = await supabase
  .from("users")
  .select("id, fraud_score, trust_score, status")
  .order("fraud_score", { ascending: false });

  <LineChart data={runnerDetails.errands}>
  <Line dataKey="trust_score" />
</LineChart>