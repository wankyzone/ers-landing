import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ MUST be service role
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔥 STEP 1: GET ALL EMAILS FROM WAITLIST
    const { data, error } = await supabase
      .from("waitlist")
      .select("email");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const emails = data.map((u) => u.email);

    if (emails.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 400 });
    }

    console.log("📧 Sending to:", emails.length, "users");

    // 🔥 STEP 2: SEND EMAILS (BATCH)
    const result = await resend.emails.send({
      from: "ERS <noreply@wankysoftware.com>",
      to: emails, // ✅ THIS is what was missing before
      subject,
      html: `<p>${message}</p>`,
    });

    console.log("✅ Broadcast result:", result);

    return NextResponse.json({
      success: true,
      sent: emails.length,
    });

  } catch (err: any) {
    console.error("Broadcast error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}