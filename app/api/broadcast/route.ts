import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // 1. Fetch users
    const { data, error } = await supabase
      .from("waitlist")
      .select("email");

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const emails = data.map((u) => u.email);

    console.log("📧 Sending to:", emails);

    if (emails.length === 0) {
      return NextResponse.json({ error: "No emails found" }, { status: 400 });
    }

    // 2. Send email
    const response = await resend.emails.send({
      from: "ERS <onboarding@resend.dev>",
      to: emails,
      subject: subject || "ERS Update",
      html: `<p>${message}</p>`,
    });

    console.log("Resend response:", response);

    return NextResponse.json({ success: true, response });
  } catch (err: any) {
    console.error("Broadcast crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}