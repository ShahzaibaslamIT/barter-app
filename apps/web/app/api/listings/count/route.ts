// app/api/listings/count/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const count = await prisma.listing.count({
    where: { is_active: true },
  });
  return NextResponse.json({ count });
}
