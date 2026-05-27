// app/api/user/[id]/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ Note: params is a Promise in Next.js 15
) {
  try {
    const { id } = await ctx.params // ✅ Must await before using
    const userId = Number(id)

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 })
    }

    // ✅ Verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { user_id: userId },
    })
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ Count active listings
    const activeListings = await prisma.listing.count({
      where: {
        user_id: userId,
        is_active: true,
      },
    })

    // ✅ Count completed trades
    const completedTrades = await prisma.barterOffer.count({
      where: {
        OR: [{ offerer_id: userId }, { listing: { user_id: userId } }],
        status: "completed",
      },
    })

    // ✅ Count total ratings
    const totalRatings = await prisma.rating.count({
      where: { rated_user_id: userId },
    })

    // ✅ Average rating
    const avgRating = await prisma.rating.aggregate({
      where: { rated_user_id: userId },
      _avg: { score: true },
    })

    return NextResponse.json({
      active_listings: activeListings,
      completed_trades: completedTrades,
      total_ratings: totalRatings,
      average_rating: avgRating._avg.score ?? 0,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

