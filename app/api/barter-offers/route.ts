// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- POST (create a new barter offer) -------------------
// export async function POST(request: NextRequest) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { listing_id, offered_listing_id, message } = await request.json()

//     if (!listing_id) {
//       return NextResponse.json({ error: "Missing listing_id" }, { status: 400 })
//     }

//     // ✅ Create the barter offer
//     const offer = await prisma.barterOffer.create({
//       data: {
//         listing_id: Number(listing_id),
//         offered_listing_id: offered_listing_id ? Number(offered_listing_id) : null,
//         offerer_id: Number(user.user_id),
//         message: message ?? null,
//         status: "pending",
//       },
//       include: {
//         listing: { select: { title: true, photos: true, user_id: true } },
//         offeredListing: { select: { title: true, photos: true } },
//         offerer: { select: { user_id: true, username: true, avatar_url: true } },
//       },
//     })

//     // ✅ Ensure a message thread exists
//     const thread = await prisma.messageThread.upsert({
//       where: { barter_id: offer.offer_id }, // barter_id is unique
//       create: {
//         barter_id: offer.offer_id,
//         listing_id: offer.listing_id,
//         user1_id: Number(user.user_id),      // offerer
//         user2_id: offer.listing.user_id,     // listing owner
//         last_message: message || null,
//         last_message_sender_id: Number(user.user_id),
//         last_message_at: new Date(),
//       },
//       update: {
//         last_message: message || null,
//         last_message_sender_id: Number(user.user_id),
//         last_message_at: new Date(),
//       },
//     })

//     // ✅ If a message was provided, create it in the Message table
//     if (message && message.trim() !== "") {
//       await prisma.message.create({
//         data: {
//           thread_id: thread.thread_id,
//           sender_id: Number(user.user_id),
//           content: message.trim(),
//         },
//       })
//     }

//     return NextResponse.json({ offer, thread }, { status: 201 })
//   } catch (error) {
//     console.error("Create barter offer error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- GET (all offers for current user) -------------------
// export async function GET(request: NextRequest) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const offers = await prisma.barterOffer.findMany({
//       where: {
//         OR: [
//           { offerer_id: Number(user.user_id) },          // offers sent
//           { listing: { user_id: Number(user.user_id) } }, // offers received
//         ],
//       },
//       include: {
//         listing: { select: { item_id: true, title: true, photos: true, type: true, user_id: true } },
//         offeredListing: { select: { item_id: true, title: true, photos: true, type: true } },
//         offerer: { select: { user_id: true, username: true, avatar_url: true } },
//       },
//       orderBy: { created_at: "desc" },
//     })

//     return NextResponse.json({ offers })
//   } catch (error) {
//     console.error("Get barter offers error:", error)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- OPTIONS (CORS preflight) -------------------
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


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
      where: { barter_id: offer.offer_id },
      create: {
        barter_id: offer.offer_id,
        listing_id: offer.listing_id,
        user1_id: Number(user.user_id),
        user2_id: offer.listing.user_id,
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

// ------------------- GET (offers filtered by type) -------------------
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'sent' or 'received'
    const userId = Number(user.user_id)

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // ✅ Decide which filter to apply
    let whereClause: any = {}
    if (type === "sent") {
      whereClause = { offerer_id: userId }
    } else if (type === "received") {
      whereClause = { listing: { user_id: userId } }
    } else {
      whereClause = {
        OR: [{ offerer_id: userId }, { listing: { user_id: userId } }],
      }
    }

    const offers = await prisma.barterOffer.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      include: {
        listing: {
          select: {
            item_id: true,
            title: true,
            type: true,
            photos: true,
            user_id: true,
            user: { select: { username: true, avatar_url: true } },
          },
        },
        offerer: {
          select: { user_id: true, username: true, avatar_url: true },
        },
        offeredListing: {
          select: {
            item_id: true,
            title: true,
            type: true,
            photos: true,
          },
        },
      },
    })

    // ✅ Flattened + nested format with listing.user_id exposed
    const formatted = offers.map((o) => ({
      offer_id: o.offer_id,
      listing_id: o.listing_id,
      offerer_id: o.offerer_id,
      status: o.status,
      message: o.message,
      created_at: o.created_at,

      listing: {
        item_id: o.listing.item_id,
        title: o.listing.title,
        type: o.listing.type,
        photos: o.listing.photos,
        user_id: o.listing.user_id, // ✅ this is the fix!
        user: {
          username: o.listing.user.username,
          avatar_url: o.listing.user.avatar_url,
        },
      },

      offeredListing: o.offeredListing
        ? {
            item_id: o.offeredListing.item_id,
            title: o.offeredListing.title,
            type: o.offeredListing.type,
            photos: o.offeredListing.photos,
          }
        : null,

      offerer: {
        user_id: o.offerer.user_id,
        username: o.offerer.username,
        avatar_url: o.offerer.avatar_url,
      },
    }))

    return NextResponse.json({ offers: formatted }, { status: 200 })
  } catch (error) {
    console.error("Get barter offers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
