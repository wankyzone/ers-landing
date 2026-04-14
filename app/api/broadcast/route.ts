import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { subject, message } = await req.json();

  // 🔥 GET ALL USERS
  const { data: users, error } = await supabase
    .from("waitlist")
    .select("email");

  if (error) {
    return NextResponse.json({ error });
  }

  // 🔥 LOOP THROUGH USERS
  const emails = users.map((u) => u.email);

  await resend.emails.send({
    from: "ERS <onboarding@resend.dev>",
    to: emails,
    subject,
    html: `<p>${message}</p>`,
  });

  return NextResponse.json({ success: true });
}