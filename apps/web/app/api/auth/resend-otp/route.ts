import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@barter/db";
import { randomInt } from "crypto";
import { resend } from "@/lib/resend";
import { sendOTP, maskPhone } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { email, via = "email" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Rate limit: 5 attempts per 5 minutes per email
    const rl = rateLimit(`resend:${String(email).toLowerCase()}`, 5, 5 * 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(rl.resetMs / 1000)} seconds.` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { user_id: true, email: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const otp = String(randomInt(100000, 999999));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp_code: otp, otp_expires: otpExpires, email_verified: false },
    });

    const usePhone = (via === "phone" || via === "whatsapp") && !!user.phone;
    const requestedChannel = via === "whatsapp" ? "whatsapp" : "sms";
    let sendError: string | null = null;
    let actualChannel: string = usePhone ? requestedChannel : "email";

    try {
      if (usePhone) {
        actualChannel = await sendOTP(user.phone!, requestedChannel);
      } else {
        await resend.emails.send({
          from: "BarterHub <no-reply@postocard.com>",
          to: email,
          subject: "Your BarterHub OTP Code",
          html: `<h1 style="letter-spacing:6px;">${otp}</h1><p>Expires in 10 minutes</p>`,
        });
      }
    } catch (sendErr: any) {
      console.error("[resend-otp] delivery failed:", sendErr);
      sendError = usePhone
        ? "SMS delivery failed. Please switch to Email and try again."
        : "Email delivery failed. Please try again.";
    }

    return NextResponse.json({
      success: !sendError,
      error: sendError ?? undefined,
      otp_sent_via: actualChannel,
      phone_hint: user.phone ? maskPhone(user.phone) : null,
      has_phone: !!user.phone,
    }, { status: sendError ? 503 : 200 });
  } catch (err: any) {
    console.error("[resend-otp] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
