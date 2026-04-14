import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT
);

export async function POST(req: Request) {
  const { subject, message } = await req.json();

  // 1. Fetch all emails
  const { data, error } = await supabase
    .from("waitlist")
    .select("email");

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  // 2. Send to all users
  const emails = data.map((u) => u.email);

  try {
    await resend.emails.send({
      from: "ERS <onboarding@resend.dev>",
      to: emails, // ✅ bulk send
      subject,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}