// export const runtime = 'nodejs';

// import { NextRequest, NextResponse } from "next/server";
// import { hashPassword, generateToken } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { UserType } from "@prisma/client"; // ✅ normal import

// // Coerce any incoming string to a valid enum value, defaulting to BOTH
// function toUserType(v: unknown): UserType {
//   const s = String(v ?? "").toLowerCase();
//   if (s === "service_provider") return UserType.service_provider;
//   if (s === "item_owner") return UserType.item_owner;
//   return UserType.both;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password, name, phone, user_type, location_text } = await request.json();

//     if (!email || !password || !name) {
//       return NextResponse.json(
//         { error: "Email, password, and name are required" },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     // Uniqueness check
//     const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
//     if (existing) {
//       return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
//     }

//     const password_hash = await hashPassword(password);

//     const created = await prisma.user.create({
//       data: {
//         email: normalizedEmail,
//         username: name,
//         password_hash,
//         user_type: toUserType(user_type), // ✅ enum-safe
//         phone: phone ?? null,
//         location_text: location_text ?? null,
//       },
//       select: {
//         user_id: true,
//         email: true,
//         username: true,
//         user_type: true,
//       },
//     });

//     const token = generateToken({
//       user_id: String(created.user_id),
//       email: created.email,
//       name: created.username,
//       user_type: created.user_type,
//     });

//     return NextResponse.json({ user: created, token }, { status: 201 });
//   } catch (e) {
//     console.error("[signup] error", e);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }



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
//       from: "BarterHub <onboarding@resend.dev>",
//       to: normalizedEmail,
//       subject: "Your Barter App OTP Code",
//       html: `
//         <h2>Verify Your Email</h2>
//         <p>Your OTP code is:</p>
//         <h1 style="font-size: 28px; letter-spacing: 5px;">${otp}</h1>
//         <p>This code will expire in 10 minutes.</p>
//       `,
//     });

//     return NextResponse.json(
//       {
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
import { resend } from "@/lib/resend"; // ⬅️ make sure lib/resend.ts is created

// Convert string → enum safely
function toUserType(v: unknown): UserType {
  const s = String(v ?? "").toLowerCase();
  if (s === "service_provider") return UserType.service_provider;
  if (s === "item_owner") return UserType.item_owner;
  return UserType.both;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, user_type, location_text } =
      await request.json();

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
    });

    if (existing) {
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

    // Create user (unverified)
    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: name,
        password_hash,
        phone: phone ?? null,
        location_text: location_text ?? null,
        user_type: toUserType(user_type),
        otp_code: otp,
        otp_expires: otpExpires,
        email_verified: false,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
      },
    });

    // Send OTP email
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

    // 👉 ADD YOUR LOG *HERE* (just before returning the response)
console.log("SIGNUP RETURN:", {
  message: "Account created successfully. Please verify your email.",
  user_id: created.user_id,
  email: created.email,
});

    // ✔ SUCCESS MESSAGE ADDED HERE — OTP untouched
    return NextResponse.json(
      {
        message: "Account created successfully. Please verify your email.",
        user_id: created.user_id,
        email: created.email,
        username: created.username,
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
