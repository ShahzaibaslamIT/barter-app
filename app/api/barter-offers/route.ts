import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- POST (create a new barter offer) -------------------
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listing_id, offered_listing_id, message } = await request.json()

    if (!listing_id) {
      return NextResponse.json({ error: "Missing listing_id" }, { status: 400 })
    }

    const offer = await prisma.barterOffer.create({
      data: {
        listing_id: Number(listing_id),
        offered_listing_id: offered_listing_id ? Number(offered_listing_id) : null,
        offerer_id: Number(user.id),
        message: message ?? null,
        status: "pending",
      },
      include: {
        listing: { select: { title: true, user_id: true, photos: true } },
        offeredListing: { select: { title: true, photos: true } },
      },
    })

    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    console.error("Create barter offer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- GET (all offers for current user) -------------------
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const offers = await prisma.barterOffer.findMany({
      where: {
        OR: [
          { offerer_id: Number(user.id) },          // offers sent
          { listing: { user_id: Number(user.id) } }, // offers received
        ],
      },
      include: {
        listing: { select: { title: true, photos: true } },
        offeredListing: { select: { title: true, photos: true } },
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({ offers })
  } catch (error) {
    console.error("Get barter offers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- OPTIONS (CORS preflight) -------------------
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
