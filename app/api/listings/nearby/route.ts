import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0")
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "10") // Default 10km
    const type = searchParams.get("type") // 'item' or 'service'
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Build the query with location-based filtering
    let query = `
      SELECT 
        l.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        ST_Distance(
          l.location,
          ST_GeogFromText('POINT(${longitude} ${latitude})')
        ) / 1000 as distance_km,
        (
          SELECT AVG(rating)::FLOAT 
          FROM ratings r 
          WHERE r.rated_user_id = l.user_id
        ) as user_rating,
        (
          SELECT COUNT(*)::INT 
          FROM ratings r 
          WHERE r.rated_user_id = l.user_id
        ) as user_rating_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.is_active = true
        AND ST_DWithin(
          l.location,
          ST_GeogFromText('POINT(${longitude} ${latitude})'),
          ${radius * 1000}
        )
    `

    const params: any[] = []

    if (type) {
      query += ` AND l.type = $${params.length + 1}`
      params.push(type)
    }

    if (category) {
      query += ` AND l.category = $${params.length + 1}`
      params.push(category)
    }

    query += `
      ORDER BY distance_km ASC, l.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `
    params.push(limit, offset)

    const listings = await sql(query, params)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      WHERE l.is_active = true
        AND ST_DWithin(
          l.location,
          ST_GeogFromText('POINT(${longitude} ${latitude})'),
          ${radius * 1000}
        )
    `

    const countParams: any[] = []
    if (type) {
      countQuery += ` AND l.type = $${countParams.length + 1}`
      countParams.push(type)
    }
    if (category) {
      countQuery += ` AND l.category = $${countParams.length + 1}`
      countParams.push(category)
    }

    const [{ total }] = await sql(countQuery, countParams)

    return NextResponse.json({
      listings,
      pagination: {
        total: Number.parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < Number.parseInt(total),
      },
    })
  } catch (error) {
    console.error("Error fetching nearby listings:", error)
    return NextResponse.json({ error: "Failed to fetch nearby listings" }, { status: 500 })
  }
}
