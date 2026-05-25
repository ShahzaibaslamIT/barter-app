export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAdminToken, ADMIN_COOKIE, SESSION_MINUTES } from "@/lib/admin-auth";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!admin || !admin.is_active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check account lock
    if (admin.locked_until && admin.locked_until > new Date()) {
      const mins = Math.ceil((admin.locked_until.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${mins} minute(s).` },
        { status: 423 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      const failed = admin.failed_login_count + 1;
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failed_login_count: failed,
          ...(failed >= MAX_FAILED
            ? { locked_until: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) }
            : {}),
        },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Reset attempts + record login time
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { failed_login_count: 0, locked_until: null, last_login_at: new Date() },
    });

    const token = signAdminToken({
      admin_id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const res = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });

    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MINUTES * 60,
    });

    return res;
  } catch (e) {
    console.error("[admin/login]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
