export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserType } from "@prisma/client"; // ✅ normal import

// Coerce any incoming string to a valid enum value, defaulting to BOTH
function toUserType(v: unknown): UserType {
  const s = String(v ?? "").toLowerCase();
  if (s === "service_provider") return UserType.service_provider;
  if (s === "item_owner") return UserType.item_owner;
  return UserType.both;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, user_type, location_text } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Uniqueness check
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: name,
        password_hash,
        user_type: toUserType(user_type), // ✅ enum-safe
        phone: phone ?? null,
        location_text: location_text ?? null,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
        user_type: true,
      },
    });

    const token = generateToken({
      id: String(created.user_id),
      email: created.email,
      name: created.username,
      user_type: created.user_type,
    });

    return NextResponse.json({ user: created, token }, { status: 201 });
  } catch (e) {
    console.error("[signup] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
