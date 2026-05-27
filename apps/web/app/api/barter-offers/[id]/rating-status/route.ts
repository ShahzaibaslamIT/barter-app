import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Await params
    const { id } = await context.params
    const offerId = Number(id)
    if (!Number.isFinite(offerId)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
    }

    // ✅ Fetch barter + users involved
    const barter = await prisma.barterOffer.findUnique({
      where: { offer_id: offerId },
      include: {
        listing: {
          include: {
            user: { select: { user_id: true, username: true } },
          },
        },
        offerer: { select: { user_id: true, username: true } },
      },
    })

    if (!barter) {
      return NextResponse.json({ error: "Barter not found" }, { status: 404 })
    }

    const currentUserId = Number(user.user_id)

    // ✅ Ensure current user is part of the barter
    const isOfferer = barter.offerer_id === currentUserId
    const isListingOwner = barter.listing.user.user_id === currentUserId
    if (!isOfferer && !isListingOwner) {
      return NextResponse.json(
        { error: "You are not part of this barter" },
        { status: 403 }
      )
    }

    // ✅ Identify the other user
    const otherUser = isOfferer ? barter.listing.user : barter.offerer

    // ✅ Fetch ratings for this barter
    const ratings = await prisma.rating.findMany({
      where: {
        barter_id: offerId,
        OR: [
          { rater_id: currentUserId },
          { rated_user_id: currentUserId },
        ],
      },
      select: {
        rating_id: true,
        rater_id: true,
        rated_user_id: true,
      },
    })

    const userRatedOther = ratings.find((r) => r.rater_id === currentUserId)
    const otherRatedUser = ratings.find((r) => r.rated_user_id === currentUserId)

    const canRate = barter.status === "completed" && !userRatedOther

    return NextResponse.json({
      barter: {
        id: barter.offer_id,
        status: barter.status,
        listing_title: barter.listing.title,
        listing_type: barter.listing.type,
        other_user_id: otherUser.user_id,
        other_user_name: otherUser.username,
      },
      can_rate: canRate,
      has_rated: !!userRatedOther,
      other_has_rated: !!otherRatedUser,
    })
  } catch (error) {
    console.error("Get rating status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
