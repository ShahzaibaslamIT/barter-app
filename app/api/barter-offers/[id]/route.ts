import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["accepted", "declined", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the offer + listing
    const offer = await prisma.barterOffer.findUnique({
      where: { id: params.id },
      include: {
        listing: { select: { userId: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Permission checks
    if (status === "cancelled" && offer.offererId !== user.id) {
      return NextResponse.json(
        { error: "Only the offerer can cancel an offer" },
        { status: 403 }
      );
    }

    if (
      (status === "accepted" || status === "declined") &&
      offer.listing.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Only the listing owner can accept or decline offers" },
        { status: 403 }
      );
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { error: "Can only modify pending offers" },
        { status: 400 }
      );
    }

    // Update offer
    const updatedOffer = await prisma.barterOffer.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // If accepted, create a message thread (only once)
    if (status === "accepted") {
      await prisma.messageThread.upsert({
        where: { barterId: params.id },
        update: {}, // nothing to update if exists
        create: {
          barterId: params.id,
          user1Id: offer.offererId,
          user2Id: offer.listing.userId,
        },
      });
    }

    return NextResponse.json({ offer: updatedOffer });
  } catch (error) {
    console.error("Update barter offer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
