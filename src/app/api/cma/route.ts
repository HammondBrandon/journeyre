import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const cmaSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  zip: z.string().min(5),
  propertyType: z.enum(["single-family", "condo-townhome", "land", "multi-family", "other"]),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  squareFootage: z.string().optional(),
  yearBuilt: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair", "needs-work"]).optional(),
  improvements: z.string().optional(),
  timeline: z.enum(["asap", "1-3-months", "3-6-months", "6-plus-months", "just-curious"]),
  additionalNotes: z.string().optional(),
});

const timelineLabels: Record<string, string> = {
  asap: "As soon as possible",
  "1-3-months": "1–3 months",
  "3-6-months": "3–6 months",
  "6-plus-months": "6+ months",
  "just-curious": "Just curious about value",
};

const conditionLabels: Record<string, string> = {
  excellent: "Excellent — Move-in ready, updated",
  good: "Good — Well maintained, minor updates needed",
  fair: "Fair — Some updating/repairs needed",
  "needs-work": "Needs Work — Major repairs needed",
};

const propertyTypeLabels: Record<string, string> = {
  "single-family": "Single-Family Home",
  "condo-townhome": "Condo / Townhome",
  land: "Land / Lot",
  "multi-family": "Multi-Family",
  other: "Other",
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = cmaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "info@journeyrealtygroup.net";

  if (!resendApiKey) {
    console.log("[CMA Form Submission]", data);
    return NextResponse.json({ success: true });
  }

  const emailHtml = `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #334155;">
  <div style="background: #0f2132; padding: 24px 32px; margin-bottom: 32px;">
    <h1 style="font-family: Arial, sans-serif; color: #ffffff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: 0.05em;">
      Journey Realty Group
    </h1>
    <p style="font-family: Arial, sans-serif; color: #00aec7; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.2em;">
      New CMA Request
    </p>
  </div>
  <div style="padding: 0 32px 32px;">
    <h2 style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; color: #0f2132; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #00aec7;">Contact Information</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f2132;">${data.name}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #00aec7;">${data.email}</a></td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.phone}</td></tr>
      <tr><td style="padding: 8px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Timeline</td><td style="padding: 8px 0; font-size: 14px;">${timelineLabels[data.timeline]}</td></tr>
    </table>

    <h2 style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; color: #0f2132; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #00aec7;">Property Information</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; width: 140px;">Address</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.address}, ${data.city}, ${data.state} ${data.zip}</td></tr>
      <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Type</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${propertyTypeLabels[data.propertyType]}</td></tr>
      ${data.bedrooms ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Bedrooms</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.bedrooms}</td></tr>` : ""}
      ${data.bathrooms ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Bathrooms</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.bathrooms}</td></tr>` : ""}
      ${data.squareFootage ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Sq. Footage</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.squareFootage}</td></tr>` : ""}
      ${data.yearBuilt ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Year Built</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${data.yearBuilt}</td></tr>` : ""}
      ${data.condition ? `<tr><td style="padding: 8px 0; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Condition</td><td style="padding: 8px 0; font-size: 14px;">${conditionLabels[data.condition]}</td></tr>` : ""}
    </table>

    ${data.improvements ? `<div style="background: #f8fafc; padding: 16px 20px; border-left: 3px solid #00aec7; margin-bottom: 16px;"><p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Recent Improvements</p><p style="font-size: 14px; line-height: 1.6; margin: 0;">${data.improvements}</p></div>` : ""}
    ${data.additionalNotes ? `<div style="background: #f8fafc; padding: 16px 20px; border-left: 3px solid #00aec7; margin-bottom: 24px;"><p style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 0 0 8px;">Additional Notes</p><p style="font-size: 14px; line-height: 1.6; margin: 0;">${data.additionalNotes}</p></div>` : ""}

    <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      Submitted via journeyrealtygroup.net CMA request form.
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
        reply_to: data.email,
        subject: `CMA Request: ${data.address}, ${data.city} — ${data.name}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("[Resend CMA Error]", errorData);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CMA API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
