export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      user_id: true,
      email: true,
      username: true,
      phone: true,
      country: true,
      state_province: true,
      city: true,
      postal_code: true,
      address_line1: true,
      address_line2: true,
      location_text: true,
      latitude: true,
      longitude: true,
      profile_complete: true,
      terms_accepted: true,
      user_type: true,
      avatar_url: true,
      // Moderation status (read by StatusBanner on the client)
      status: true,
      suspension_reason: true,
      suspended_until: true,
      blacklist_reason: true,
      blacklisted_until: true,
      warning_count: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
