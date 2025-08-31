import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "sent" or "received"

    let offers;

    if (type === "sent") {
      // Offers sent by current user
      offers = await prisma.barterOffer.findMany({
        where: { offererId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              title: true,
              type: true,
              photos: true,
              user: { select: { name: true, avatarUrl: true } },
            },
          },
          offeredListing: {
            select: { title: true, type: true, photos: true },
          },
        },
      });
    } else {
      // Offers received by current user (listings they own)
      offers = await prisma.barterOffer.findMany({
        where: { listing: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: { title: true, type: true, photos: true },
          },
          offerer: { select: { name: true, avatarUrl: true } },
          offeredListing: {
            select: { title: true, type: true, photos: true },
          },
        },
      });
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Get barter offers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listing_id, offered_listing_id, message } = await request.json();

    if (!listing_id) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Check if listing exists & not owned by current user
    const listing = await prisma.listing.findUnique({
      where: { id: listing_id },
      select: { userId: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: "Cannot make offer on your own listing" },
        { status: 400 }
      );
    }

    // Check if user already has a pending offer for this listing
    const existingOffer = await prisma.barterOffer.findFirst({
      where: {
        listingId: listing_id,
        offererId: user.id,
        status: "pending",
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: "You already have a pending offer for this listing" },
        { status: 400 }
      );
    }

    // If offered_listing_id provided, check it belongs to current user
    if (offered_listing_id) {
      const offeredListing = await prisma.listing.findFirst({
        where: {
          id: offered_listing_id,
          userId: user.id,
          isActive: true,
        },
      });

      if (!offeredListing) {
        return NextResponse.json(
          { error: "Offered listing not found or not owned by you" },
          { status: 400 }
        );
      }
    }

    // Create offer
    const offer = await prisma.barterOffer.create({
      data: {
        listingId: listing_id,
        offererId: user.id,
        offeredListingId: offered_listing_id || null,
        message,
        status: "pending",
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Create barter offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
