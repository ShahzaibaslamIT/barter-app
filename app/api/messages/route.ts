import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { thread_id, content } = await request.json()

    if (!thread_id || !content?.trim()) {
      return NextResponse.json({ error: "Thread ID and content are required" }, { status: 400 })
    }

    // Verify user has access to this thread
    const threadCheck = await sql`
      SELECT * FROM message_threads 
      WHERE id = ${thread_id} AND (user_1_id = ${user.id} OR user_2_id = ${user.id})
    `

    if (threadCheck.length === 0) {
      return NextResponse.json({ error: "Thread not found or access denied" }, { status: 404 })
    }

    // Insert the message
    const result = await sql`
      INSERT INTO messages (thread_id, sender_id, content)
      VALUES (${thread_id}, ${user.id}, ${content.trim()})
      RETURNING *
    `

    // Get sender info for the response
    const messageWithSender = await sql`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ${result[0].id}
    `

    return NextResponse.json({ message: messageWithSender[0] }, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
