// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@barter/db";
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

//     // Fetch user
//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Check if OTP exists
//     if (!user.otp_code || !user.otp_expires) {
//       return NextResponse.json(
//         { error: "No OTP pending verification" },
//         { status: 400 }
//       );
//     }

//     // Check OTP match
//     if (user.otp_code !== otp) {
//       return NextResponse.json(
//         { error: "Incorrect OTP" },
//         { status: 401 }
//       );
//     }

//     // Check expiration
//     if (new Date() > user.otp_expires) {
//       return NextResponse.json(
//         { error: "OTP has expired" },
//         { status: 410 }
//       );
//     }

//     // OTP SUCCESS — verify + clear OTP
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

//     // Create login token (same for login/signup/forgot flows)
//     const token = generateToken({
//       user_id: String(updated.user_id),
//       email: updated.email,
//       name: updated.username,
//       user_type: updated.user_type,
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "OTP verified successfully",
//         user: updated,
//         token,
//       },
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



// // app/api/auth/verify-otp/route.ts
// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@barter/db";

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

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     if (!user.otp_code || !user.otp_expires) {
//       return NextResponse.json(
//         { error: "No OTP pending verification" },
//         { status: 400 }
//       );
//     }

//     if (user.otp_code !== otp) {
//       return NextResponse.json(
//         { error: "Incorrect OTP" },
//         { status: 401 }
//       );
//     }

//     if (new Date() > user.otp_expires) {
//       return NextResponse.json(
//         { error: "OTP has expired" },
//         { status: 410 }
//       );
//     }

//     // ✅ SUCCESS: mark verified + clear OTP
//     const updatedUser = await prisma.user.update({
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
//         profile_complete: true,
//         latitude: true,
//         longitude: true,
//         location_text: true,
//         country: true,
//         state_province: true,
//         city: true,
//       },
//     });

//     // Generate token for authentication
//     const token = `${updatedUser.user_id}:${updatedUser.email}`;

//     // ✅ RETURN USER OBJECT WITH PROFILE DATA
//     return NextResponse.json(
//       {
//         success: true,
//         user: updatedUser,
//         token,
//       },
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



// app/api/auth/verify-otp/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@barter/db";
import { generateToken } from "@/lib/auth";
import { checkOTP } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, via = "email" } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Phone/WhatsApp OTP → verify via Twilio Verify API
    if ((via === "phone" || via === "whatsapp") && user.phone) {
      try {
        const approved = await checkOTP(user.phone, otp);
        if (!approved) {
          return NextResponse.json(
            { error: "Incorrect OTP" },
            { status: 401 }
          );
        }
      } catch (verifyErr) {
        console.error("[verify-otp] Twilio Verify check failed:", verifyErr);
        return NextResponse.json(
          { error: "Incorrect or expired OTP" },
          { status: 401 }
        );
      }
    } else {
      // Email OTP → verify against DB
      if (!user.otp_code || !user.otp_expires) {
        return NextResponse.json(
          { error: "No OTP pending verification" },
          { status: 400 }
        );
      }

      if (user.otp_code !== otp) {
        return NextResponse.json(
          { error: "Incorrect OTP" },
          { status: 401 }
        );
      }

      if (new Date() > user.otp_expires) {
        return NextResponse.json(
          { error: "OTP has expired" },
          { status: 410 }
        );
      }
    }

    // ✅ SUCCESS: mark verified + clear OTP
    const updatedUser = await prisma.user.update({
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
        profile_complete: true,
        latitude: true,
        longitude: true,
        location_text: true,
        country: true,
        state_province: true,
        city: true,
        terms_accepted: true,
      },
    });

    // ✅ FIX: Generate proper JWT token
    const token = generateToken({
      user_id: updatedUser.user_id,
      email: updatedUser.email,
      name: updatedUser.username,
      user_type: updatedUser.user_type,
    });

    // ✅ RETURN USER OBJECT WITH PROPER TOKEN
    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        token, // ← Now this is a proper JWT!
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