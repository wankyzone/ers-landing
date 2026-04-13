import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT
);

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    const { data: users, error } = await supabase
      .from("waitlist")
      .select("email");

    if (error) throw error;

    for (const user of users || []) {
      await resend.emails.send({
        from: "ERS <onboarding@resend.dev>",
        to: user.email,
        subject,
        html: `<p>${message}</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Broadcast error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}