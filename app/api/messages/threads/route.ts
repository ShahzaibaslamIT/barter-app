import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all message threads for the current user
    const result = await sql`
      SELECT 
        mt.id as thread_id,
        mt.barter_id,
        mt.created_at as thread_created_at,
        bo.listing_id,
        l.title as listing_title,
        l.type as listing_type,
        l.photos as listing_photos,
        CASE 
          WHEN mt.user_1_id = ${user.id} THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE 
          WHEN mt.user_1_id = ${user.id} THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        CASE 
          WHEN mt.user_1_id = ${user.id} THEN mt.user_2_id
          ELSE mt.user_1_id
        END as other_user_id,
        m.content as last_message,
        m.created_at as last_message_time,
        m.sender_id as last_message_sender_id,
        COALESCE(unread.unread_count, 0) as unread_count
      FROM message_threads mt
      JOIN barter_offers bo ON mt.barter_id = bo.id
      JOIN listings l ON bo.listing_id = l.id
      JOIN users u1 ON mt.user_1_id = u1.id
      JOIN users u2 ON mt.user_2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT content, created_at, sender_id
        FROM messages 
        WHERE thread_id = mt.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      LEFT JOIN (
        SELECT thread_id, COUNT(*) as unread_count
        FROM messages
        WHERE is_read = false AND sender_id != ${user.id}
        GROUP BY thread_id
      ) unread ON unread.thread_id = mt.id
      WHERE mt.user_1_id = ${user.id} OR mt.user_2_id = ${user.id}
      ORDER BY COALESCE(m.created_at, mt.created_at) DESC
    `

    return NextResponse.json({ threads: result })
  } catch (error) {
    console.error("Get message threads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
