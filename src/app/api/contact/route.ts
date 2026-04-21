import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.enum(["buying", "selling", "cma", "general", "other"]),
  message: z.string().min(10),
});

const subjectLabels: Record<string, string> = {
  buying: "Buying a Home",
  selling: "Selling My Home",
  cma: "Free Home Valuation / CMA",
  general: "General Inquiry",
  other: "Other",
};

export async function POST(request: NextRequest) {
  // Rate limiting: check for abuse (basic — use Upstash or similar in production)
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  void ip; // Available for logging/rate-limiting middleware

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, email, phone, subject, message } = parsed.data;

  // Resend integration
  // Add RESEND_API_KEY and CONTACT_TO_EMAIL to your .env.local
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@journeyrealtygroup.net";

  if (!resendApiKey) {
    // Development fallback — log to console
    console.log("[Contact Form Submission]", {
      name,
      email,
      phone,
      subject: subjectLabels[subject],
      message,
    });
    return NextResponse.json({ success: true });
  }

  const emailBody = `
New Contact Form Submission — Journey Realty Group

Name: ${name}
Email: ${email}
Phone: ${phone ?? "Not provided"}
Topic: ${subjectLabels[subject]}

Message:
${message}

---
Submitted via journeyrealtygroup.net contact form.
  `.trim();

  const emailHtml = `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #334155;">
  <div style="background: #0f2132; padding: 24px 32px; margin-bottom: 32px;">
    <h1 style="font-family: Arial, sans-serif; color: #ffffff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: 0.05em;">
      Journey Realty Group
    </h1>
    <p style="font-family: Arial, sans-serif; color: #00aec7; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.2em;">
      New Contact Form Submission
    </p>
  </div>

  <div style="padding: 0 32px 32px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; width: 120px;">Name</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f2132;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Email</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f2132;">
          <a href="mailto:${email}" style="color: #00aec7;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Phone</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f2132;">${phone ?? "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Topic</td>
        <td style="padding: 10px 0; font-size: 14px; color: #0f2132;">${subjectLabels[subject]}</td>
      </tr>
    </table>

    <div style="background: #f8fafc; padding: 20px 24px; border-left: 3px solid #00aec7; margin-bottom: 24px;">
      <p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin: 0 0 10px;">Message</p>
      <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      Submitted via journeyrealtygroup.net contact form.
    </p>
  </div>
</div>
  `.trim();

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Journey Realty Group <no-reply@journeyrealtygroup.net>",
        to: [toEmail],
        reply_to: email,
        subject: `New Contact: ${subjectLabels[subject]} — ${name}`,
        text: emailBody,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("[Resend Error]", errorData);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
