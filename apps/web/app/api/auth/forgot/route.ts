// app/api/auth/forgot/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    // Create OTP
    const otp = String(randomInt(100000, 999999));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DB
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        otp_code: otp,
        otp_expires: otpExpires,
      },
    });

    // SEND OTP EMAIL
    await resend.emails.send({
      from: "BarterHub <no-reply@postocard.com>",
      to: normalizedEmail,
      subject: "Your Password Reset OTP Code",
      html: `
        <h2>Password Reset Request</h2>
        <p>Use the following OTP to reset your password:</p>
        <h1 style="font-size: 28px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    return NextResponse.json(
      {
        message: "OTP sent to your email.",
        email: normalizedEmail,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
