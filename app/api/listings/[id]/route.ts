import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      SELECT l.*, u.name as user_name, u.avatar_url as user_avatar, u.user_type,
             COALESCE(AVG(r.rating), 0) as user_rating,
             COUNT(r.rating) as user_rating_count
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN barter_offers bo ON l.id = bo.listing_id AND bo.status = 'completed'
      LEFT JOIN ratings r ON bo.id = r.barter_id AND r.rated_user_id = u.id
      WHERE l.id = ${params.id} AND l.is_active = true
      GROUP BY l.id, u.name, u.avatar_url, u.user_type
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing: result[0] })
  } catch (error) {
    console.error("Get listing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, barter_request, is_active } = await request.json()

    const result = await sql`
      UPDATE listings 
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          barter_request = COALESCE(${barter_request}, barter_request),
          is_active = COALESCE(${is_active}, is_active),
          updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ listing: result[0] })
  } catch (error) {
    console.error("Update listing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      UPDATE listings 
      SET is_active = false, updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Delete listing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
