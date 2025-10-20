import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ---------------- GET ratings for a user ----------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // ✅ Get ratings with related info
    const ratings = await prisma.rating.findMany({
      where: { rated_user_id: Number(userId) },
      include: {
        rater: { select: { user_id: true, username: true, avatar_url: true } },
        barter: {
          include: {
            listing: { select: { item_id: true, title: true, type: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    // ✅ Calculate average rating
    const avgResult = await prisma.rating.aggregate({
      where: { rated_user_id: Number(userId) },
      _avg: { score: true },
      _count: { score: true },
    })

    return NextResponse.json({
      ratings: ratings.map((r) => ({
        rating_id: r.rating_id,
        barter_id: r.barter_id,
        rater_id: r.rater_id,
        rater_name: r.rater.username,
        rater_avatar: r.rater.avatar_url,
        rated_user_id: r.rated_user_id,
        score: r.score,
        comment: r.comment,
        listing_id: r.barter.listing.item_id,
        listing_title: r.barter.listing.title,
        listing_type: r.barter.listing.type,
        created_at: r.created_at,
      })),
      average_rating: avgResult._avg.score || 0,
      total_ratings: avgResult._count.score || 0,
    })
  } catch (error) {
    console.error("Get ratings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ---------------- POST create a rating ----------------
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // ✅ Normalize and force to numbers
    const barter_id = parseInt(body.barter_id, 10)
    const rated_user_id = parseInt(body.rated_user_id, 10)
    const score = body.score !== undefined ? Number(body.score) : Number(body.rating)
    const comment = body.comment ?? null

    // ✅ Validate inputs
    if (isNaN(barter_id) || isNaN(rated_user_id) || isNaN(score)) {
      return NextResponse.json(
        { error: "Barter ID, rated user ID, and score are required" },
        { status: 400 }
      )
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (comment && comment.length > 250) {
      return NextResponse.json(
        { error: "Comment must be 250 characters or less" },
        { status: 400 }
      )
    }

    // ✅ Verify barter exists and is completed
    const barter = await prisma.barterOffer.findUnique({
      where: { offer_id: barter_id },
      include: { listing: true },
    })

    if (!barter || barter.status !== "completed") {
      return NextResponse.json(
        { error: "Barter not found or not completed" },
        { status: 404 }
      )
    }

    // ✅ Ensure user is part of the barter
    const currentUserId = Number(user.user_id)
    if (
      barter.offerer_id !== currentUserId &&
      barter.listing.user_id !== currentUserId
    ) {
      return NextResponse.json(
        { error: "You are not part of this barter" },
        { status: 403 }
      )
    }

    // ✅ Prevent self-rating
    if (rated_user_id === currentUserId) {
      return NextResponse.json(
        { error: "Cannot rate yourself" },
        { status: 400 }
      )
    }

    // ✅ Ensure rated_user_id is the other party
    const expectedRatedUserId =
      barter.offerer_id === currentUserId
        ? barter.listing.user_id
        : barter.offerer_id
    if (rated_user_id !== expectedRatedUserId) {
      return NextResponse.json(
        { error: "Can only rate the other party in the barter" },
        { status: 400 }
      )
    }

    // ✅ Check if rating already exists
    const existing = await prisma.rating.findUnique({
      where: {
        barter_id_rater_id: {
          barter_id,
          rater_id: currentUserId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already rated this barter" },
        { status: 400 }
      )
    }

    // ✅ Create rating
    const newRating = await prisma.rating.create({
      data: {
        barter_id,
        rater_id: currentUserId,
        rated_user_id,
        score,
        comment,
      },
    })

    return NextResponse.json({ rating: newRating }, { status: 201 })
  } catch (error) {
    console.error("Create rating error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
