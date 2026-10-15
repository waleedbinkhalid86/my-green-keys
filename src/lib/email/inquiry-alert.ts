const DEFAULT_ALERT_EMAIL = "mygreenkeys26@gmail.com";

type InquiryAlert = {
  name: string;
  schoolName: string | null;
  phone: string;
  message: string | null;
};

/**
 * Best-effort email to the founder via Resend's REST API. Never throws: a missing
 * key or failed send is logged and the inquiry (already saved) is unaffected.
 */
export async function sendInquiryAlert(inquiry: InquiryAlert): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[schools/inquiry] RESEND_API_KEY not set, skipping email alert");
    return;
  }

  const to = process.env.INQUIRY_ALERT_EMAIL?.trim() || DEFAULT_ALERT_EMAIL;
  const text = [
    "New school inquiry from mygreenkeys.com/schools",
    "",
    `Name: ${inquiry.name}`,
    `School: ${inquiry.schoolName ?? "-"}`,
    `Phone: ${inquiry.phone}`,
    "",
    "Message:",
    inquiry.message ?? "-",
    "",
    "View all inquiries: https://mygreenkeys.com/admin/inquiries",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "My Green Keys <onboarding@resend.dev>",
        to: [to],
        subject: `New school inquiry: ${inquiry.schoolName ?? inquiry.name}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[schools/inquiry] Resend alert failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[schools/inquiry] Resend alert failed:", err);
  }
}
