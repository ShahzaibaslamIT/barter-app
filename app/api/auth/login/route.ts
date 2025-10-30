


// export const runtime = "nodejs"

// import { type NextRequest, NextResponse } from "next/server"
// import { verifyPassword, generateToken } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"
// import type { UserType } from "@prisma/client"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json()

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       )
//     }

//     const normalizedEmail = String(email).trim().toLowerCase()

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//       select: {
//         user_id: true,
//         email: true,
//         username: true,
//         user_type: true,
//         password_hash: true, // ⚡ this can be string | null
//       },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     // 🚨 Handle Google accounts that don’t have a password
//     if (!user.password_hash || user.password_hash === "google-oauth") {
//       return NextResponse.json(
//         { error: "This account uses Google sign-in. Please log in with Google instead." },
//         { status: 403 }
//       )
//     }

//     const ok = await verifyPassword(password, user.password_hash)
//     if (!ok) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
//     }

//     const token = generateToken({
//       user_id: String(user.user_id),
//       email: user.email,
//       name: user.username,
//       user_type: user.user_type as UserType,
//     })

//     return NextResponse.json({
//       user: {
//         id: String(user.user_id),
//         email: user.email,
//         username: user.username,
//         user_type: user.user_type,
//       },
//       token,
//     })
//   } catch (e) {
//     console.error("[login] error", e)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }


export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserType } from "@prisma/client";

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
        password_hash: true, // string | null
      },
    });

    // 🧠 Case 1: no account
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    // 🧠 Case 2: Google-only account
    if (!user.password_hash || user.password_hash === "google-oauth") {
      return NextResponse.json(
        { error: "This account uses Google Sign-In. Please log in with Google instead." },
        { status: 403 }
      );
    }

    // 🧠 Case 3: wrong password
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials. Please try again." },
        { status: 401 }
      );
    }

    // 🧠 Case 4: success
    const token = generateToken({
      user_id: String(user.user_id),
      email: user.email,
      name: user.username,
      user_type: user.user_type as UserType,
    });

    return NextResponse.json({
      user: {
        id: String(user.user_id),
        email: user.email,
        username: user.username,
        user_type: user.user_type,
      },
      token,
    });
  } catch (e) {
    console.error("[login] error", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


