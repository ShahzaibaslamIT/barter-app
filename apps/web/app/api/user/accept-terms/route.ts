export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@barter/db";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      terms_accepted: true,
      terms_accepted_at: new Date(),
    },
    select: {
      user_id: true,
      terms_accepted: true,
      terms_accepted_at: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
