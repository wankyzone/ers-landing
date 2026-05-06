import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    await resend.emails.send({
      from: "ERS <onboarding@resend.dev>",
      to: email,
      subject: "You're on the ERS waitlist 🚀",
      html: "<p>You’re now on the ERS early access list.</p>",
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Send email error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
