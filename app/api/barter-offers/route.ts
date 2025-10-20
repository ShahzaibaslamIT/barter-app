import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- POST (create a new barter offer) -------------------
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listing_id, offered_listing_id, message } = await request.json()

    if (!listing_id) {
      return NextResponse.json({ error: "Missing listing_id" }, { status: 400 })
    }

    // ✅ Create the barter offer
    const offer = await prisma.barterOffer.create({
      data: {
        listing_id: Number(listing_id),
        offered_listing_id: offered_listing_id ? Number(offered_listing_id) : null,
        offerer_id: Number(user.user_id),
        message: message ?? null,
        status: "pending",
      },
      include: {
        listing: { select: { title: true, photos: true, user_id: true } },
        offeredListing: { select: { title: true, photos: true } },
        offerer: { select: { user_id: true, username: true, avatar_url: true } },
      },
    })

    // ✅ Ensure a message thread exists
    const thread = await prisma.messageThread.upsert({
      where: { barter_id: offer.offer_id }, // barter_id is unique
      create: {
        barter_id: offer.offer_id,
        listing_id: offer.listing_id,
        user1_id: Number(user.user_id),      // offerer
        user2_id: offer.listing.user_id,     // listing owner
        last_message: message || null,
        last_message_sender_id: Number(user.user_id),
        last_message_at: new Date(),
      },
      update: {
        last_message: message || null,
        last_message_sender_id: Number(user.user_id),
        last_message_at: new Date(),
      },
    })

    // ✅ If a message was provided, create it in the Message table
    if (message && message.trim() !== "") {
      await prisma.message.create({
        data: {
          thread_id: thread.thread_id,
          sender_id: Number(user.user_id),
          content: message.trim(),
        },
      })
    }

    return NextResponse.json({ offer, thread }, { status: 201 })
  } catch (error) {
    console.error("Create barter offer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ------------------- GET (all offers for current user) -------------------
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const offers = await prisma.barterOffer.findMany({
      where: {
        OR: [
          { offerer_id: Number(user.user_id) },          // offers sent
          { listing: { user_id: Number(user.user_id) } }, // offers received
        ],
      },
      include: {
        listing: { select: { item_id: true, title: true, photos: true, type: true, user_id: true } },
        offeredListing: { select: { item_id: true, title: true, photos: true, type: true } },
        offerer: { select: { user_id: true, username: true, avatar_url: true } },
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

