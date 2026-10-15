import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { sendInquiryAlert } from "@/lib/email/inquiry-alert";
import {
  getClientIp,
  isRateLimited,
  rateLimitKey,
  recordRateLimitHit,
} from "@/lib/rate-limit/server";

// Every submission counts (not just failures): this limit exists to stop spam.
const MAX_SUBMISSIONS = 5;
const WINDOW_SECONDS = 60 * 60;

const INVALID_ERROR = "Please check your name and phone number and try again.";
const TOO_MANY_ERROR = "Too many messages sent. Please try again later.";
const UNAVAILABLE_ERROR = "The form is not available right now. Please try again soon.";

const PHONE_PATTERN = /^[0-9+\-().\s]+$/;

type InquiryBody = {
  name?: unknown;
  school_name?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Public /schools contact form. Saves with the service role; never returns raw errors. */
export async function POST(req: Request) {
  let body: InquiryBody;
  try {
    body = (await req.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: INVALID_ERROR }, { status: 400 });
  }

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    console.error("[schools/inquiry] service role client unavailable:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  const key = rateLimitKey("schools-inquiry", getClientIp(req));

  try {
    if (await isRateLimited(admin, key, MAX_SUBMISSIONS, WINDOW_SECONDS)) {
      return NextResponse.json({ error: TOO_MANY_ERROR }, { status: 429 });
    }
    await recordRateLimitHit(admin, key, WINDOW_SECONDS);
  } catch (err) {
    // Fail closed: no inserts without a working limiter.
    console.error("[schools/inquiry] rate limiter failed, refusing submission:", err);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  // Honeypot filled: pretend success so bots get no signal.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name);
  const schoolName = clean(body.school_name);
  const phone = clean(body.phone);
  const message = clean(body.message);
  const phoneDigits = phone.replace(/\D/g, "").length;

  if (
    name.length < 1 ||
    name.length > 100 ||
    schoolName.length > 150 ||
    phone.length < 7 ||
    phone.length > 30 ||
    !PHONE_PATTERN.test(phone) ||
    phoneDigits < 7 ||
    message.length > 2000
  ) {
    return NextResponse.json({ error: INVALID_ERROR }, { status: 400 });
  }

  const inquiry = {
    name,
    school_name: schoolName || null,
    phone,
    message: message || null,
  };

  const { error: insertError } = await admin.from("school_inquiries").insert(inquiry);
  if (insertError) {
    console.error("[schools/inquiry] insert failed:", insertError.message);
    return NextResponse.json({ error: UNAVAILABLE_ERROR }, { status: 503 });
  }

  await sendInquiryAlert({
    name: inquiry.name,
    schoolName: inquiry.school_name,
    phone: inquiry.phone,
    message: inquiry.message,
  });

  return NextResponse.json({ ok: true });
}
