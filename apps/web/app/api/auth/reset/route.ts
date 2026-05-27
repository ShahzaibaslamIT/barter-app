// // app/api/auth/reset/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { hashPassword } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const { email, otp, new_password } = await req.json();

//     if (!email || !otp || !new_password) {
//       return NextResponse.json(
//         { error: "Email, OTP, and new password are required." },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = email.trim().toLowerCase();

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "Invalid email." },
//         { status: 404 }
//       );
//     }

//     if (!user.otp_code || user.otp_code !== otp) {
//       return NextResponse.json(
//         { error: "Invalid OTP." },
//         { status: 400 }
//       );
//     }

//     if (user.otp_expires && user.otp_expires < new Date()) {
//       return NextResponse.json(
//         { error: "OTP has expired." },
//         { status: 400 }
//       );
//     }

//     const hashed = await hashPassword(new_password);

//     await prisma.user.update({
//       where: { email: normalizedEmail },
//       data: {
//         password_hash: hashed,
//         otp_code: null,
//         otp_expires: null,
//       },
//     });

//     return NextResponse.json(
//       { message: "Password reset successful." },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("RESET ERROR:", err);
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }


// app/api/auth/reset/route.ts

// app/api/auth/reset/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, new_password } = await req.json();

    if (!email || !otp || !new_password) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 404 }
      );
    }

    if (!user.otp_code) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.otp_code !== otp) {
      return NextResponse.json(
        { error: "Incorrect OTP." },
        { status: 400 }
      );
    }

    // Expired OTP?
    if (user.otp_expires && user.otp_expires < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 410 }
      );
    }

    const hashed = await hashPassword(new_password);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password_hash: hashed,
        otp_code: null,
        otp_expires: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successful." },
      { status: 200 }
    );
  } catch (err) {
    console.error("RESET ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

