import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(user.user_id)
    const offerId = Number(params.id)
    if (!Number.isFinite(offerId)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 })
    }

    const { score, comment } = await request.json()
    if (!score || score < 1 || score > 5) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 })
    }

    const barter = await prisma.barterOffer.findUnique({
      where: { offer_id: offerId },
      include: { listing: { select: { user_id: true } } },
    })

    if (!barter) {
      return NextResponse.json({ error: "Barter not found" }, { status: 404 })
    }

    // ⚠️ adjust this depending on your enum
    if (barter.status !== ("completed" as any)) {
      return NextResponse.json(
        { error: "Can only rate completed barters" },
        { status: 400 }
      )
    }

    if (barter.offerer_id !== userId && barter.listing.user_id !== userId) {
      return NextResponse.json(
        { error: "You are not part of this barter" },
        { status: 403 }
      )
    }

    const ratedUserId =
      barter.offerer_id === userId
        ? barter.listing.user_id
        : barter.offerer_id

    // ✅ prevent duplicate rating
    const existing = await prisma.rating.findFirst({
      where: { barter_id: offerId, rater_id: userId },
    })
    if (existing) {
      return NextResponse.json(
        { error: "You have already rated this barter" },
        { status: 400 }
      )
    }

    const rating = await prisma.rating.create({
      data: {
        barter_id: offerId,
        rater_id: userId,
        rated_user_id: ratedUserId,
        score,
        comment: comment ?? null,
      },
    })

    // Update avg rating for rated user
    const stats = await prisma.rating.aggregate({
      where: { rated_user_id: ratedUserId },
      _avg: { score: true },
      _count: { score: true },
    })

    await prisma.user.update({
      where: { user_id: ratedUserId },
      data: {
        rating: stats._avg.score ?? null,
        rating_count: stats._count.score,
      },
    })

    return NextResponse.json({ rating })
  } catch (error) {
    console.error("Create rating error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
