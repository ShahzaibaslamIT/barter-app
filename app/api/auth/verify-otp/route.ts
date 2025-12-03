// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { generateToken } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const { email, otp } = await req.json();

//     if (!email || !otp) {
//       return NextResponse.json(
//         { error: "Email and OTP are required" },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     // Find user
//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Check OTP exists
//     if (!user.otp_code || !user.otp_expires) {
//       return NextResponse.json(
//         { error: "OTP not generated or already verified" },
//         { status: 400 }
//       );
//     }

//     // Check OTP match
//     if (user.otp_code !== otp) {
//       return NextResponse.json(
//         { error: "Incorrect OTP" },
//         { status: 400 }
//       );
//     }

//     // Check expiration
//     if (new Date() > user.otp_expires) {
//       return NextResponse.json(
//         { error: "OTP has expired" },
//         { status: 410 } // 410 Gone
//       );
//     }

//     // Mark email verified + clear OTP
//     const updated = await prisma.user.update({
//       where: { email: normalizedEmail },
//       data: {
//         email_verified: true,
//         otp_code: null,
//         otp_expires: null,
//       },
//       select: {
//         user_id: true,
//         email: true,
//         username: true,
//         user_type: true,
//       },
//     });

//     // Generate login token
//     const token = generateToken({
//       user_id: String(updated.user_id),
//       email: updated.email,
//       name: updated.username,
//       user_type: updated.user_type,
//     });

//     return NextResponse.json(
//       { success: true, user: updated, token },
//       { status: 200 }
//     );
//   } catch (e) {
//     console.error("[verify-otp] error", e);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if OTP exists
    if (!user.otp_code || !user.otp_expires) {
      return NextResponse.json(
        { error: "No OTP pending verification" },
        { status: 400 }
      );
    }

    // Check OTP match
    if (user.otp_code !== otp) {
      return NextResponse.json(
        { error: "Incorrect OTP" },
        { status: 401 }
      );
    }

    // Check expiration
    if (new Date() > user.otp_expires) {
      return NextResponse.json(
        { error: "OTP has expired" },
        { status: 410 }
      );
    }

    // OTP SUCCESS — verify + clear OTP
    const updated = await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        email_verified: true,
        otp_code: null,
        otp_expires: null,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
        user_type: true,
      },
    });

    // Create login token (same for login/signup/forgot flows)
    const token = generateToken({
      user_id: String(updated.user_id),
      email: updated.email,
      name: updated.username,
      user_type: updated.user_type,
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        user: updated,
        token,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[verify-otp] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

