import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const SUBJECT_LABELS: Record<string, string> = {
  general: "General inquiry",
  schools: "School / institution",
  support: "Technical support",
  partnership: "Partnership",
  feedback: "Product feedback",
};

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone: string;
  role?: string;
  subject: string;
  message: string;
};

export async function sendContactNotificationEmail(payload: ContactEmailPayload) {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!to) {
    throw new Error("CONTACT_NOTIFY_EMAIL is not configured");
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Nexscape <onboarding@resend.dev>";

  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject;

  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `[Nexscape Contact] ${subjectLabel} — ${payload.name}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">New contact enquiry</h2>
        <p style="color: #64748b; margin-top: 0;">Submitted via nexscape.in contact form</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Name</td><td style="padding: 8px 0;"><strong>${escapeHtml(payload.name)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Mobile</td><td style="padding: 8px 0;"><a href="tel:${escapeHtml(payload.phone.replace(/\s/g, ""))}">${escapeHtml(payload.phone)}</a></td></tr>
          ${payload.role ? `<tr><td style="padding: 8px 0; color: #64748b;">Role</td><td style="padding: 8px 0;">${escapeHtml(payload.role)}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #64748b;">Subject</td><td style="padding: 8px 0;">${escapeHtml(subjectLabel)}</td></tr>
        </table>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase;">Message</p>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(payload.message)}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">Reply directly to this email to respond to ${escapeHtml(payload.name)}.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
