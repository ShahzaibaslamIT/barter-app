export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // ensure you have a singleton client here
import type { UserType, ListingType } from "@prisma/client";


export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        user_id: true,
        email: true,
        username: true,
        user_type: true as true, // ensure TS infers it
        password_hash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // user.user_type is already the Prisma enum UserType
    const token = generateToken({
      id: String(user.user_id),
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
