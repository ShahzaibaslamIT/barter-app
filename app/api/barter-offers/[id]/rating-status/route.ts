import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch barter offer + relations
    const barter = await prisma.barterOffer.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            type: true,
            user: { select: { id: true, name: true } },
          },
        },
        offerer: { select: { id: true, name: true } },
        ratings: {
          where: {
            OR: [
              { raterId: user.id },
              { ratedUserId: user.id },
            ],
          },
          select: { id: true, raterId: true, ratedUserId: true },
        },
      },
    });

    if (!barter) {
      return NextResponse.json({ error: "Barter not found" }, { status: 404 });
    }

    // Ensure current user is part of barter
    if (
      barter.offererId !== user.id &&
      barter.listing.user.id !== user.id
    ) {
      return NextResponse.json(
        { error: "You are not part of this barter" },
        { status: 403 }
      );
    }

    // Figure out other user
    const otherUserId =
      barter.offererId === user.id
        ? barter.listing.user.id
        : barter.offererId;

    const otherUserName =
      barter.offererId === user.id
        ? barter.listing.user.name
        : barter.offerer.name;

    // Rating check
    const userRatedOther = barter.ratings.find((r) => r.raterId === user.id);
    const otherRatedUser = barter.ratings.find(
      (r) => r.ratedUserId === user.id
    );

    return NextResponse.json({
      barter: {
        id: barter.id,
        status: barter.status,
        listing_title: barter.listing.title,
        listing_type: barter.listing.type,
        other_user_id: otherUserId,
        other_user_name: otherUserName,
      },
      can_rate: barter.status === "completed" && !userRatedOther,
      has_rated: !!userRatedOther,
      other_has_rated: !!otherRatedUser,
    });
  } catch (error) {
    console.error("Get rating status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
