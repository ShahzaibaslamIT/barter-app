import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// Update an offer's status (accept / decline / cancel)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Await params
    const { id } = await context.params
    const offerId = Number(id)
    if (!Number.isFinite(offerId)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
    }

    const { status } = await request.json()

    if (!["accepted", "declined", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const offer = await prisma.barterOffer.findUnique({
      where: { offer_id: offerId },
      include: { listing: { select: { user_id: true } } },
    })

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // ✅ Permission checks
    if (status === "cancelled" && offer.offerer_id !== Number(user.id)) {
      return NextResponse.json(
        { error: "Only the offerer can cancel this offer" },
        { status: 403 }
      )
    }

    if (
      (status === "accepted" || status === "declined") &&
      offer.listing.user_id !== Number(user.id)
    ) {
      return NextResponse.json(
        { error: "Only the listing owner can accept/decline" },
        { status: 403 }
      )
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending offers can be modified" },
        { status: 400 }
      )
    }

    const updatedOffer = await prisma.barterOffer.update({
      where: { offer_id: offerId },
      data: {
        status,
      },
    })

    return NextResponse.json({ offer: updatedOffer })
  } catch (error) {
    console.error("Update barter offer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ✅ CORS preflight
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
