// export const runtime = "nodejs";

// import { type NextRequest, NextResponse } from "next/server";
// import { verifyPassword } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { randomInt } from "crypto";
// import { resend } from "@/lib/resend";

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
//         password_hash: true,
//       },
//     });

//     // 1️⃣ Case: user not found
//     if (!user) {
//       return NextResponse.json(
//         { error: "No account found with this email. Please sign up first." },
//         { status: 404 }
//       );
//     }

//     // 2️⃣ Case: Google login account
//     if (!user.password_hash || user.password_hash === "google-oauth") {
//       return NextResponse.json(
//         {
//           error:
//             "This account uses Google Sign-In. Please log in with Google instead.",
//         },
//         { status: 403 }
//       );
//     }

//     // 3️⃣ Case: incorrect password
//     const ok = await verifyPassword(password, user.password_hash);
//     if (!ok) {
//       return NextResponse.json(
//         { error: "Invalid credentials. Please try again." },
//         { status: 401 }
//       );
//     }

//     // -------------------------------------
//     // 4️⃣ OTP FLOW STARTS HERE
//     // -------------------------------------

//     // Generate OTP
//     const otp = String(randomInt(100000, 999999));
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 mins

//     // Save OTP in DB
//     await prisma.user.update({
//       where: { user_id: user.user_id },
//       data: {
//         otp_code: otp,
//         otp_expires: otpExpires,
//       },
//     });

//     // Send OTP email
//     await resend.emails.send({
//      from: "BarterHub <no-reply@postocard.com>",

//       to: normalizedEmail,
//       subject: "Your BarterHub Login OTP Code",
//       html: `
//         <h2>Login Verification</h2>
//         <p>Use the OTP code below to continue:</p>
//         <h1 style="font-size:28px; letter-spacing:6px;">${otp}</h1>
//         <p>This code will expire in 10 minutes.</p>
//       `,
//     });

//     // Return OTP required
//     return NextResponse.json({
//       requires_verification: true,
//       email: normalizedEmail,
//       message: "OTP sent to your email.",
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
import { sendOTP, maskPhone } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";
import { enforceUserStatusByEmail } from "@/lib/user-status";

export async function POST(request: NextRequest) {
  try {
    const { email, password, otp_via = "email" } = await request.json();

    // Rate limit: 10 attempts per 5 minutes per email
    const rl = rateLimit(`login:${String(email).toLowerCase()}`, 10, 5 * 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(rl.resetMs / 1000)} seconds.` },
        { status: 429 }
      );
    }

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

        // profile & location awareness
        profile_complete: true,
        country: true,
        state_province: true,
        city: true,
        phone: true,
      },
    });

    // 0️⃣ Check if user is suspended/banned/blacklisted
    const statusBlock = await enforceUserStatusByEmail(normalizedEmail);
    if (statusBlock) return statusBlock;

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
          // 🚨 frontend can use this flag
          login_method: "google",
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

    // ── OTP FLOW ──────────────────────────────────────────────
    const otp = String(randomInt(100000, 999999));
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { otp_code: otp, otp_expires: otpExpires },
    });

    const usePhone = otp_via === "phone" && !!user.phone;
    let actualChannel: string = usePhone ? "phone" : "email";

    if (usePhone) {
      actualChannel = await sendOTP(user.phone!, "sms");
    } else {
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
    }

    const message = actualChannel === "whatsapp"
      ? "OTP sent to your WhatsApp."
      : usePhone
        ? "OTP sent to your phone."
        : "OTP sent to your email.";

    return NextResponse.json({
      requires_verification: true,
      email: normalizedEmail,
      otp_sent_via: actualChannel === "whatsapp" ? "whatsapp" : (usePhone ? "phone" : "email"),
      has_phone: !!user.phone,
      phone_hint: user.phone ? maskPhone(user.phone) : null,
      message,
      profile_complete: user.profile_complete === true,
      city: user.city,
      country: user.country,
    });
  } catch (e) {
    console.error("[login] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


