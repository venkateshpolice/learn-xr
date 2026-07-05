import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { sendContactNotificationEmail } from "@/lib/email";
import ContactMessage, { type ContactSubject } from "@/models/ContactMessage";

const VALID_SUBJECTS: ContactSubject[] = [
  "general",
  "schools",
  "support",
  "partnership",
  "feedback",
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function normalizePhone(phone: string): string {
  return phone.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !subject || !message?.trim()) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid mobile number (10–15 digits)" },
        { status: 400 },
      );
    }

    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 },
      );
    }

    const enquiry = {
      name: name.trim(),
      email: email.toLowerCase(),
      phone: normalizePhone(phone),
      role: role?.trim() || undefined,
      subject: subject as ContactSubject,
      message: message.trim(),
    };

    await connectDB();
    await ContactMessage.create(enquiry);

    try {
      await sendContactNotificationEmail(enquiry);
    } catch (emailErr) {
      console.error("Contact email error:", emailErr);
      return NextResponse.json(
        {
          error:
            "Your enquiry was saved but we could not send the notification email. Please try again or email us directly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
