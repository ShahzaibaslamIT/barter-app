// app/api/notifications/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@barter/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, device } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { token },
      create: {
        user_id: Number(user.user_id),
        token,
        device: device || "web",
      },
      update: {
        user_id: Number(user.user_id),
        device: device || "web",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[register-push] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}