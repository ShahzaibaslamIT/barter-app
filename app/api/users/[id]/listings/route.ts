import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow users to fetch their own listings for making offers
    if (params.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await pool.query(
      `SELECT id, type, title, description, category, photos, condition, created_at
       FROM listings 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [user.id],
    )

    return NextResponse.json({ listings: result.rows })
  } catch (error) {
    console.error("Get user listings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
