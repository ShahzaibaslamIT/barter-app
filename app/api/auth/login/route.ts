
// export const runtime = "nodejs";

// import { type NextRequest, NextResponse } from "next/server";
// import { verifyPassword, generateToken } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import type { UserType } from "@prisma/client";

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required." },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//       select: {
//         user_id: true,
//         email: true,
//         username: true,
//         user_type: true,
//         password_hash: true, // string | null
//       },
//     });

//     // 🧠 Case 1: no account
//     if (!user) {
//       return NextResponse.json(
//         { error: "No account found with this email. Please sign up first." },
//         { status: 404 }
//       );
//     }

//     // 🧠 Case 2: Google-only account
//     if (!user.password_hash || user.password_hash === "google-oauth") {
//       return NextResponse.json(
//         { error: "This account uses Google Sign-In. Please log in with Google instead." },
//         { status: 403 }
//       );
//     }

//     // 🧠 Case 3: wrong password
//     const ok = await verifyPassword(password, user.password_hash);
//     if (!ok) {
//       return NextResponse.json(
//         { error: "Invalid credentials. Please try again." },
//         { status: 401 }
//       );
//     }

//     // 🧠 Case 4: success
//     const token = generateToken({
//       user_id: String(user.user_id),
//       email: user.email,
//       name: user.username,
//       user_type: user.user_type as UserType,
//     });

//     return NextResponse.json({
//       user: {
//         id: String(user.user_id),
//         email: user.email,
//         username: user.username,
//         user_type: user.user_type,
//       },
//       token,
//     });
//   } catch (e) {
//     console.error("[login] error", e);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import { resend } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        user_id: true,
        email: true,
        username: true,
        user_type: true,
        password_hash: true,
      },
    });

    // 1️⃣ Case: user not found
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    // 2️⃣ Case: Google login account
    if (!user.password_hash || user.password_hash === "google-oauth") {
      return NextResponse.json(
        {
          error:
            "This account uses Google Sign-In. Please log in with Google instead.",
        },
        { status: 403 }
      );
    }

    // 3️⃣ Case: incorrect password
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials. Please try again." },
        { status: 401 }
      );
    }

    // -------------------------------------
    // 4️⃣ OTP FLOW STARTS HERE
    // -------------------------------------

    // Generate OTP
    const otp = String(randomInt(100000, 999999));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins

    // Save OTP in DB
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        otp_code: otp,
        otp_expires: otpExpires,
      },
    });

    // Send OTP email
    await resend.emails.send({
     from: "BarterHub <no-reply@postocard.com>",

      to: normalizedEmail,
      subject: "Your BarterHub Login OTP Code",
      html: `
        <h2>Login Verification</h2>
        <p>Use the OTP code below to continue:</p>
        <h1 style="font-size:28px; letter-spacing:6px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    // Return OTP required
    return NextResponse.json({
      requires_verification: true,
      email: normalizedEmail,
      message: "OTP sent to your email.",
    });
  } catch (e) {
    console.error("[login] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
