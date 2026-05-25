import twilio from "twilio";

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN
) {
  console.warn("[sms] Twilio env vars not set — SMS will not be sent.");
}

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Normalize a phone number to E.164 format.
 * If it already starts with '+', leave it alone.
 * Otherwise assume Pakistan (+92) as a sensible default fallback
 * and strip leading 0.
 */
export function normalizePhone(phone: string): string {
  const stripped = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (stripped.startsWith("+")) return stripped;
  if (stripped.startsWith("0")) return "+92" + stripped.slice(1);
  if (stripped.startsWith("92")) return "+" + stripped;
  return "+" + stripped;
}

/** Mask phone for display: +92***1234 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length < 6) return "***";
  return normalized.slice(0, 3) + "***" + normalized.slice(-4);
}

/**
 * Send OTP via Twilio Verify API.
 * Tries the requested channel first. If SMS is blocked (error 60410),
 * automatically retries via WhatsApp.
 * Returns the channel that was actually used.
 */
export async function sendOTP(
  to: string,
  channel: "sms" | "whatsapp" | "email" = "sms"
): Promise<string> {
  if (!client || !VERIFY_SID) {
    console.error("[sms] Twilio Verify not configured");
    throw new Error("SMS service not configured. Please set TWILIO_VERIFY_SERVICE_SID.");
  }

  const toNormalized = normalizePhone(to);

  try {
    await client.verify.v2
      .services(VERIFY_SID)
      .verifications.create({ to: toNormalized, channel });

    console.log("[sms] Verify OTP sent to", toNormalized, "via", channel);
    return channel;
  } catch (err: any) {
    // If SMS is blocked (60410), automatically retry via WhatsApp
    if (channel === "sms" && err?.code === 60410) {
      console.warn("[sms] SMS blocked for", toNormalized, "— retrying via WhatsApp");

      await client.verify.v2
        .services(VERIFY_SID)
        .verifications.create({ to: toNormalized, channel: "whatsapp" });

      console.log("[sms] Verify OTP sent to", toNormalized, "via whatsapp (fallback)");
      return "whatsapp";
    }

    throw err;
  }
}

/**
 * Check OTP via Twilio Verify API.
 * Returns true if the code is correct.
 */
export async function checkOTP(to: string, code: string): Promise<boolean> {
  if (!client || !VERIFY_SID) {
    throw new Error("SMS service not configured.");
  }

  const toNormalized = normalizePhone(to);

  const check = await client.verify.v2
    .services(VERIFY_SID)
    .verificationChecks.create({ to: toNormalized, code });

  return check.status === "approved";
}

/**
 * Legacy raw SMS sender (fallback — uses FROM number).
 * May fail for international numbers on toll-free.
 */
export async function sendSMS(to: string, message: string): Promise<void> {
  if (!client) {
    console.error("[sms] Twilio not configured — cannot send SMS to", to);
    throw new Error("SMS service not configured. Please set TWILIO_* env vars.");
  }

  const toNormalized = normalizePhone(to);
  const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

  await client.messages.create({
    body: message,
    from: fromNumber,
    to: toNormalized,
  });

  console.log("[sms] Sent to", toNormalized);
}
