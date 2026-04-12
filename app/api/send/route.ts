import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    await resend.emails.send({
      from: "ERS <hello@wankysoftware.com>",
      to: email,
      subject: "You're on the ERS waitlist 🚀",
      html: `<p>You’re now on the ERS early access list.</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error });
  }
}