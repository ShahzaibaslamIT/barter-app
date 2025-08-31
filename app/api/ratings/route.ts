import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get ratings for a specific user
    const result = await pool.query(
      `SELECT r.*, u.name as rater_name, u.avatar_url as rater_avatar,
              bo.listing_id, l.title as listing_title, l.type as listing_type
       FROM ratings r
       JOIN users u ON r.rater_id = u.id
       JOIN barter_offers bo ON r.barter_id = bo.id
       JOIN listings l ON bo.listing_id = l.id
       WHERE r.rated_user_id = $1
       ORDER BY r.created_at DESC`,
      [userId],
    )

    // Calculate average rating
    const avgResult = await pool.query(
      "SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE rated_user_id = $1",
      [userId],
    )

    return NextResponse.json({
      ratings: result.rows,
      average_rating: Number.parseFloat(avgResult.rows[0].avg_rating) || 0,
      total_ratings: Number.parseInt(avgResult.rows[0].total_ratings) || 0,
    })
  } catch (error) {
    console.error("Get ratings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { barter_id, rated_user_id, rating, comment } = await request.json()

    if (!barter_id || !rated_user_id || !rating) {
      return NextResponse.json({ error: "Barter ID, rated user ID, and rating are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (comment && comment.length > 250) {
      return NextResponse.json({ error: "Comment must be 250 characters or less" }, { status: 400 })
    }

    // Verify the barter exists and is completed
    const barterResult = await pool.query(
      `SELECT bo.*, l.user_id as listing_owner_id
       FROM barter_offers bo
       JOIN listings l ON bo.listing_id = l.id
       WHERE bo.id = $1 AND bo.status = 'completed'`,
      [barter_id],
    )

    if (barterResult.rows.length === 0) {
      return NextResponse.json({ error: "Barter not found or not completed" }, { status: 404 })
    }

    const barter = barterResult.rows[0]

    // Verify user is part of this barter
    if (barter.offerer_id !== user.id && barter.listing_owner_id !== user.id) {
      return NextResponse.json({ error: "You are not part of this barter" }, { status: 403 })
    }

    // Verify user is not rating themselves
    if (rated_user_id === user.id) {
      return NextResponse.json({ error: "Cannot rate yourself" }, { status: 400 })
    }

    // Verify the rated user is the other party in the barter
    const expectedRatedUserId = barter.offerer_id === user.id ? barter.listing_owner_id : barter.offerer_id
    if (rated_user_id !== expectedRatedUserId) {
      return NextResponse.json({ error: "Can only rate the other party in the barter" }, { status: 400 })
    }

    // Check if rating already exists
    const existingRating = await pool.query("SELECT id FROM ratings WHERE barter_id = $1 AND rater_id = $2", [
      barter_id,
      user.id,
    ])

    if (existingRating.rows.length > 0) {
      return NextResponse.json({ error: "You have already rated this barter" }, { status: 400 })
    }

    // Insert the rating
    const result = await pool.query(
      `INSERT INTO ratings (barter_id, rater_id, rated_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [barter_id, user.id, rated_user_id, rating, comment],
    )

    return NextResponse.json({ rating: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Create rating error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
