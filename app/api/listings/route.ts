import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Get listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (category) where.category = category;

    const listings = await prisma.listing.findMany({
      where,
      include: { user: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      listings,
      hasMore: listings.length === limit,
    });
  } catch (error) {
    console.error("[v0] Get listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ Create listing
export async function POST(request: NextRequest) {
  try {
    const { title, description, category, user_id } = await request.json();

    if (!title || !description || !category || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        user: { connect: { user_id } }, // connect via schema's PK
      },
      include: { user: true },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
