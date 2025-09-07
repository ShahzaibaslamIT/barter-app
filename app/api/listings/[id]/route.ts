import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET Listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { item_id: Number(params.id) },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            user_type: true,
          },
        },
      },
    });

    if (!listing || listing.is_active === false) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE Listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, category, condition, image_url } = await request.json();

    const listing = await prisma.listing.updateMany({
      where: { item_id: Number(params.id), user_id: user.user_id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        category: category ?? undefined,
        condition: condition ?? undefined,
        image_url: image_url ?? undefined,
      },
    });

    if (listing.count === 0) {
      return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 });
    }

    const updatedListing = await prisma.listing.findUnique({
      where: { item_id: Number(params.id) },
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE Listing (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const listing = await prisma.listing.updateMany({
      where: { item_id: Number(params.id), user_id: user.user_id },
      data: { is_active: false },
    });

    if (listing.count === 0) {
      return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
