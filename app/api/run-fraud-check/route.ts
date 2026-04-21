export async function POST() {
  await fetch("https:bdosmcxftlxpcurcpoeu.functions.supabase.co/fraud-engine");

  return Response.json({ ok: true });
}