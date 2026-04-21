export function calculateFraudScore({
  total,
  completed,
  failed,
  cancelled,
  recentJobs,
  trustScore = 100,
}: {
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  recentJobs: number;
  trustScore?: number;
}) {
  let score = 0;

  const completionRate = total === 0 ? 100 : (completed / total) * 100;

  if (completionRate < 50) score += 25;
  if (failed >= 3) score += 30;
  if (cancelled >= 3) score += 20;
  if (recentJobs > 10) score += 15;
  if (trustScore < 40) score += 10;

  return Math.min(score, 100);
}