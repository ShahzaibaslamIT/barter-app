import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to this thread
    const threadCheck = await sql`
      SELECT * FROM message_threads 
      WHERE id = ${params.id} AND (user_1_id = ${user.id} OR user_2_id = ${user.id})
    `

    if (threadCheck.length === 0) {
      return NextResponse.json({ error: "Thread not found or access denied" }, { status: 404 })
    }

    const thread = threadCheck[0]

    // Get thread details with barter info
    const threadDetails = await sql`
      SELECT 
        mt.*,
        bo.listing_id,
        bo.status as barter_status,
        l.title as listing_title,
        l.type as listing_type,
        l.photos as listing_photos,
        u1.name as user_1_name,
        u1.avatar_url as user_1_avatar,
        u2.name as user_2_name,
        u2.avatar_url as user_2_avatar
      FROM message_threads mt
      JOIN barter_offers bo ON mt.barter_id = bo.id
      JOIN listings l ON bo.listing_id = l.id
      JOIN users u1 ON mt.user_1_id = u1.id
      JOIN users u2 ON mt.user_2_id = u2.id
      WHERE mt.id = ${params.id}
    `

    // Get messages for this thread
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const messagesResult = await sql`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.thread_id = ${params.id}
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Mark messages as read for the current user
    await sql`
      UPDATE messages SET is_read = true 
      WHERE thread_id = ${params.id} AND sender_id != ${user.id} AND is_read = false
    `

    return NextResponse.json({
      thread: threadDetails[0],
      messages: messagesResult.reverse(), // Reverse to show oldest first
      hasMore: messagesResult.length === limit,
    })
  } catch (error) {
    console.error("Get thread messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
