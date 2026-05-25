// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { hashPassword } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { UserType } from "@prisma/client";
// import { randomInt } from "crypto";
// import { resend } from "@/lib/resend"; // ⬅️ make sure lib/resend.ts is created

// // Convert string → enum safely
// function toUserType(v: unknown): UserType {
//   const s = String(v ?? "").toLowerCase();
//   if (s === "service_provider") return UserType.service_provider;
//   if (s === "item_owner") return UserType.item_owner;
//   return UserType.both;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password, name, phone, user_type, location_text } =
//       await request.json();

//     if (!email || !password || !name) {
//       return NextResponse.json(
//         { error: "Email, password, and name are required" },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     // Check if user exists
//     const existing = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (existing) {
//       return NextResponse.json(
//         { error: "A user already exists with this email." },
//         { status: 409 }
//       );
//     }

    

//     // Hash password
//     const password_hash = await hashPassword(password);

//     // Generate OTP
//     const otp = String(randomInt(100000, 999999));
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Create user (unverified)
//     const created = await prisma.user.create({
//       data: {
//         email: normalizedEmail,
//         username: name,
//         password_hash,
//         phone: phone ?? null,
//         location_text: location_text ?? null,
//         user_type: toUserType(user_type),
//         otp_code: otp,
//         otp_expires: otpExpires,
//         email_verified: false,
//       },
//       select: {
//         user_id: true,
//         email: true,
//         username: true,
//       },
//     });

//     // Send OTP email
//     await resend.emails.send({
//    from: "BarterHub <no-reply@postocard.com>",
//     to: normalizedEmail,
//     subject: "Your Barter App OTP Code",
//     html: `
//         <h2>Verify Your Email</h2>
//         <p>Your OTP code is:</p>
//         <h1 style="font-size: 28px; letter-spacing: 5px;">${otp}</h1>
//         <p>This code will expire in 10 minutes.</p>
//       `,
//     });

//     // 👉 ADD YOUR LOG *HERE* (just before returning the response)
// console.log("SIGNUP RETURN:", {
//   message: "Account created successfully. Please verify your email.",
//   user_id: created.user_id,
//   email: created.email,
// });

//     // ✔ SUCCESS MESSAGE ADDED HERE — OTP untouched
//     return NextResponse.json(
//       {
//         message: "Account created successfully. Please verify your email.",
//         user_id: created.user_id,
//         email: created.email,
//         username: created.username,
//         requires_verification: true,
//       },
//       { status: 201 }
//     );
//   } catch (e) {
//     console.error("[signup] error", e);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client";
import { randomInt } from "crypto";
import { resend } from "@/lib/resend";
import { sendOTP, maskPhone } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";
import { enforceUserStatusByEmail } from "@/lib/user-status";

// Convert string → enum safely
function toUserType(v: unknown): UserType {
  const s = String(v ?? "").toLowerCase();
  if (s === "service_provider") return UserType.service_provider;
  if (s === "item_owner") return UserType.item_owner;
  return UserType.both;
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      phone,
      user_type,
      location_text,
      otp_via = "email",

      // structured profile location (optional)
      country,
      state_province,
      city,
      postal_code,
      address_line1,
      address_line2,
    } = await request.json();

    // Rate limit: 5 attempts per 5 minutes per email
    const rl = rateLimit(`signup:${String(email).toLowerCase()}`, 5, 5 * 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(rl.resetMs / 1000)} seconds.` },
        { status: 429 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { user_id: true, email_verified: true },
    });

    // Already verified → hard reject
    if (existing?.email_verified) {
      // Check if banned/suspended before giving "already exists"
      const statusBlock = await enforceUserStatusByEmail(normalizedEmail);
      if (statusBlock) return statusBlock;

      return NextResponse.json(
        { error: "A user already exists with this email." },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate OTP
    const otp = String(randomInt(100000, 999999));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const profileData = {
      username: name,
      password_hash,
      phone: phone ?? null,
      location_text: location_text ?? null,
      country: country ?? null,
      state_province: state_province ?? null,
      city: city ?? null,
      postal_code: postal_code ?? null,
      address_line1: address_line1 ?? null,
      address_line2: address_line2 ?? null,
      user_type: toUserType(user_type),
      otp_code: otp,
      otp_expires: otpExpires,
      email_verified: false,
    };

    const selectFields = {
      user_id: true,
      email: true,
      username: true,
      country: true,
      state_province: true,
      city: true,
    };

    // Unverified record exists → update it (re-signup / retry)
    const created = existing
      ? await prisma.user.update({
          where: { email: normalizedEmail },
          data: profileData,
          select: selectFields,
        })
      : await prisma.user.create({
          data: { email: normalizedEmail, ...profileData },
          select: selectFields,
        });

    // Send OTP — wrapped so delivery failure doesn't return 500
    const usePhone = otp_via === "phone" && !!phone;
    let otpError: string | null = null;
    let actualChannel: string = usePhone ? "phone" : "email";

    try {
      if (usePhone) {
        // Twilio Verify handles OTP generation + international delivery
        // Returns actual channel used (may fallback to whatsapp)
        actualChannel = await sendOTP(phone, "sms");
      } else {
        await resend.emails.send({
          from: "BarterHub <no-reply@postocard.com>",
          to: normalizedEmail,
          subject: "Your Barter App OTP Code",
          html: `
            <h2>Verify Your Email</h2>
            <p>Your OTP code is:</p>
            <h1 style="font-size: 28px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          `,
        });
      }
    } catch (sendErr) {
      console.error("[signup] OTP send failed:", sendErr);
      otpError = usePhone
        ? "Account created but SMS failed. Use 'Resend' to get your code."
        : "Account created but email failed. Use 'Resend' to get your code.";
    }

    const sentViaMessage = actualChannel === "whatsapp"
      ? "Account created. OTP sent via WhatsApp."
      : usePhone
        ? "Account created. Please verify your phone number."
        : "Account created successfully. Please verify your email.";

    return NextResponse.json(
      {
        message: otpError ?? sentViaMessage,
        user_id: created.user_id,
        email: created.email,
        username: created.username,
        country: created.country,
        state_province: created.state_province,
        city: created.city,
        otp_sent_via: actualChannel === "whatsapp" ? "whatsapp" : (usePhone ? "phone" : "email"),
        has_phone: !!phone,
        phone_hint: phone ? maskPhone(phone) : null,
        requires_verification: true,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[signup] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
