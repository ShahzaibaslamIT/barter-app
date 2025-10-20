// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// export async function PUT(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { id } = await context.params
//     const offerId = Number(id)
//     if (!Number.isFinite(offerId)) {
//       return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
//     }

//     const { status } = await request.json()

//     if (!["accepted", "declined", "withdrawn", "completed"].includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 })
//     }

//     const offer = await prisma.barterOffer.findUnique({
//       where: { offer_id: offerId },
//       include: { listing: { select: { user_id: true } } },
//     })

//     if (!offer) {
//       return NextResponse.json({ error: "Offer not found" }, { status: 404 })
//     }

//     // Permission checks
//     if (status === "withdrawn" && offer.offerer_id !== Number(user.user_id)) {
//       return NextResponse.json(
//         { error: "Only the offerer can withdraw this offer" },
//         { status: 403 }
//       )
//     }

//     if (
//       (status === "accepted" || status === "declined") &&
//       offer.listing.user_id !== Number(user.user_id)
//     ) {
//       return NextResponse.json(
//         { error: "Only the listing owner can accept/decline" },
//         { status: 403 }
//       )
//     }

//     if (
//       status === "completed" &&
//       offer.listing.user_id !== Number(user.user_id) &&
//       offer.offerer_id !== Number(user.user_id)
//     ) {
//       return NextResponse.json(
//         { error: "Only participants can mark complete" },
//         { status: 403 }
//       )
//     }

//     // Transition rules
//     if (offer.status === "pending" && !["accepted", "declined", "withdrawn"].includes(status)) {
//       return NextResponse.json(
//         { error: "Pending offers can only be accepted, declined, or withdrawn" },
//         { status: 400 }
//       )
//     }

//     if (offer.status === "accepted" && status !== "completed") {
//       return NextResponse.json(
//         { error: "Accepted offers can only be marked completed" },
//         { status: 400 }
//       )
//     }

//     if (["declined", "withdrawn", "completed"].includes(offer.status)) {
//       return NextResponse.json(
//         { error: "This offer can no longer be modified" },
//         { status: 400 }
//       )
//     }

//     const updatedOffer = await prisma.barterOffer.update({
//       where: { offer_id: offerId },
//       data: { status },
//     })

//     return NextResponse.json({ offer: updatedOffer })
//   } catch (error) {
//     console.error("Update barter offer error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "PUT,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// export async function PUT(
//   request: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     // 🔑 Await user
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { id } = context.params
//     const offerId = Number(id)
//     if (!Number.isFinite(offerId)) {
//       return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
//     }

//     const { status } = await request.json()

//     if (!["accepted", "declined", "withdrawn", "completed"].includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 })
//     }

//     const offer = await prisma.barterOffer.findUnique({
//       where: { offer_id: offerId },
//       include: { listing: { select: { user_id: true } } },
//     })

//     if (!offer) {
//       return NextResponse.json({ error: "Offer not found" }, { status: 404 })
//     }

//     // Permission checks
//     if (status === "withdrawn" && offer.offerer_id !== Number(user.user_id)) {
//       return NextResponse.json(
//         { error: "Only the offerer can withdraw this offer" },
//         { status: 403 }
//       )
//     }

//     if (
//       (status === "accepted" || status === "declined") &&
//       offer.listing.user_id !== Number(user.user_id)
//     ) {
//       return NextResponse.json(
//         { error: "Only the listing owner can accept/decline" },
//         { status: 403 }
//       )
//     }

//     if (
//       status === "completed" &&
//       offer.listing.user_id !== Number(user.user_id) &&
//       offer.offerer_id !== Number(user.user_id)
//     ) {
//       return NextResponse.json(
//         { error: "Only participants can mark complete" },
//         { status: 403 }
//       )
//     }

//     // Transition rules
//     if (offer.status === "pending" && !["accepted", "declined", "withdrawn"].includes(status)) {
//       return NextResponse.json(
//         { error: "Pending offers can only be accepted, declined, or withdrawn" },
//         { status: 400 }
//       )
//     }

//     if (offer.status === "accepted" && status !== "completed") {
//       return NextResponse.json(
//         { error: "Accepted offers can only be marked completed" },
//         { status: 400 }
//       )
//     }

//     if (["declined", "withdrawn", "completed"].includes(offer.status)) {
//       return NextResponse.json(
//         { error: "This offer can no longer be modified" },
//         { status: 400 }
//       )
//     }

//     const updatedOffer = await prisma.barterOffer.update({
//       where: { offer_id: offerId },
//       data: { status },
//     })

//     return NextResponse.json({ offer: updatedOffer })
//   } catch (error) {
//     console.error("Update barter offer error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "PUT,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }

// app/api/barter-offers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest, getAuthSession } from "@/lib/auth"

// 🔑 Unified auth resolver
async function getAuthUser(request: NextRequest) {
  // 1. Try JWT (manual login)
  const jwtUser = await getUserFromRequest(request)
  if (jwtUser) return jwtUser

  // 2. Try NextAuth (Google login)
  const session = await getAuthSession()
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, email: true, username: true, user_type: true },
    })
    if (dbUser) {
      return {
        user_id: dbUser.user_id,
        email: dbUser.email,
        name: dbUser.username,
        user_type: dbUser.user_type,
      }
    }
  }

  return null
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params
    const offerId = Number(id)
    if (!Number.isFinite(offerId)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
    }

    const { status } = await request.json()

    if (!["accepted", "declined", "withdrawn", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const offer = await prisma.barterOffer.findUnique({
      where: { offer_id: offerId },
      include: { listing: { select: { user_id: true } } },
    })

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // --- Permission checks ---
    if (status === "withdrawn" && offer.offerer_id !== Number(user.user_id)) {
      return NextResponse.json(
        { error: "Only the offerer can withdraw this offer" },
        { status: 403 }
      )
    }

    if (
      (status === "accepted" || status === "declined") &&
      offer.listing.user_id !== Number(user.user_id)
    ) {
      return NextResponse.json(
        { error: "Only the listing owner can accept/decline" },
        { status: 403 }
      )
    }

    if (
      status === "completed" &&
      offer.listing.user_id !== Number(user.user_id) &&
      offer.offerer_id !== Number(user.user_id)
    ) {
      return NextResponse.json(
        { error: "Only participants can mark complete" },
        { status: 403 }
      )
    }

    // --- Transition rules ---
    if (offer.status === "pending" && !["accepted", "declined", "withdrawn"].includes(status)) {
      return NextResponse.json(
        { error: "Pending offers can only be accepted, declined, or withdrawn" },
        { status: 400 }
      )
    }

    if (offer.status === "accepted" && status !== "completed") {
      return NextResponse.json(
        { error: "Accepted offers can only be marked completed" },
        { status: 400 }
      )
    }

    if (["declined", "withdrawn", "completed"].includes(offer.status)) {
      return NextResponse.json(
        { error: "This offer can no longer be modified" },
        { status: 400 }
      )
    }

    const updatedOffer = await prisma.barterOffer.update({
      where: { offer_id: offerId },
      data: { status },
    })

    return NextResponse.json({ offer: updatedOffer })
  } catch (error) {
    console.error("Update barter offer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

