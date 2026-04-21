export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    "https://bdosmcxftlxpcurcpoeu.functions.supabase.co/fraud-engine",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  return Response.json(data);
}