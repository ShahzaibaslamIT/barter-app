import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/listings called")
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'item' or 'service'
    const category = searchParams.get("category")
    const sort = searchParams.get("sort") || "recent"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("[v0] Query params:", { type, category, sort, limit, offset })

    const result = await sql`
      SELECT l.*, u.name as user_name, u.avatar_url as user_avatar,
             0 as user_rating, 0 as user_rating_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.is_active = true
      ${type ? sql`AND l.type = ${type}` : sql``}
      ${category ? sql`AND l.category = ${category}` : sql``}
      ORDER BY l.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    console.log("[v0] Query result:", result.length, "listings found")

    return NextResponse.json({
      listings: result,
      hasMore: result.length === limit,
    })
  } catch (error) {
    console.error("[v0] Get listings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      type,
      title,
      description,
      category,
      location_text,
      latitude,
      longitude,
      barter_request,
      photos,
      condition,
      availability,
      skill_level,
    } = await request.json()

    // Validate required fields
    if (!type || !title || !description || !category || !location_text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be 100 characters or less" }, { status: 400 })
    }

    if (description.length < 20) {
      return NextResponse.json({ error: "Description must be at least 20 characters" }, { status: 400 })
    }

    if (type === "item" && (!photos || photos.length === 0)) {
      return NextResponse.json({ error: "At least one photo is required for items" }, { status: 400 })
    }

    // Use provided coordinates or default location
    const locationPoint = latitude && longitude ? `POINT(${longitude} ${latitude})` : `POINT(-97.7431 30.2672)` // Default to Austin, TX

    const result = await sql`
      INSERT INTO listings (
        user_id, type, title, description, category, location, location_text,
        barter_request, photos, condition, availability
      ) VALUES (
        ${user.id}, ${type}, ${title}, ${description}, ${category}, 
        ST_GeogFromText(${locationPoint}), ${location_text},
        ${barter_request}, ${photos || []}, ${condition}, ${availability}
      )
      RETURNING *
    `

    return NextResponse.json({ listing: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Create listing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
