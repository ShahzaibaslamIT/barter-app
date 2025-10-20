// // app/api/messages/thread/[id]/route.ts
// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// export async function GET(
//   request: NextRequest,
//   ctx: { params: Promise<{ id: string }> } // Next.js 15: params is a Promise
// ) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { id } = await ctx.params
//     const threadId = Number(id)
//     if (!Number.isFinite(threadId)) {
//       return NextResponse.json({ error: "Invalid thread id" }, { status: 400 })
//     }

//     const thread = await prisma.messageThread.findUnique({
//       where: { thread_id: threadId },
//       include: {
//         barter: { include: { listing: true } },
//         listing: true,
//         user1: { select: { user_id: true, username: true, avatar_url: true } },
//         user2: { select: { user_id: true, username: true, avatar_url: true } },
//         messages: {
//           orderBy: { created_at: "asc" },
//           include: {
//             sender: { select: { user_id: true, username: true, avatar_url: true } },
//           },
//         },
//       },
//     })

//     if (
//       !thread ||
//       (thread.user1_id !== Number(user.user_id) &&
//         thread.user2_id !== Number(user.user_id))
//     ) {
//       return NextResponse.json(
//         { error: "Thread not found or access denied" },
//         { status: 404 }
//       )
//     }

//     // ✅ Flattened response to match ChatInterface expectations
//     return NextResponse.json({
//       thread: {
//         id: thread.thread_id,
//         barter_id: thread.barter_id ?? null,
//         listing_id: thread.listing_id ?? null,
//         listing_title: thread.listing?.title ?? thread.barter?.listing?.title ?? "",
//         listing_type: thread.listing?.type ?? thread.barter?.listing?.type ?? "item",
//         listing_photos: thread.listing?.photos ?? thread.barter?.listing?.photos ?? [],
//         barter_status: thread.barter?.status ?? "pending",
//         user_1_id: String(thread.user1.user_id),
//         user_1_name: thread.user1.username,
//         user_1_avatar: thread.user1.avatar_url,
//         user_2_id: String(thread.user2.user_id),
//         user_2_name: thread.user2.username,
//         user_2_avatar: thread.user2.avatar_url,
//         last_message: thread.last_message,
//         last_message_at: thread.last_message_at,
//         last_message_sender_id: thread.last_message_sender_id,
//         created_at: thread.created_at,
//       },
//       messages: thread.messages.map((m) => ({
//         id: String(m.message_id),
//         thread_id: m.thread_id,
//         sender_id: String(m.sender_id),
//         sender_name: m.sender?.username ?? "Anonymous",
//         sender_avatar: m.sender?.avatar_url ?? null,
//         content: m.content,
//         created_at: m.created_at,
//         is_read: false, // schema doesn’t have is_read → supply default
//       })),
//     })
//   } catch (error) {
//     console.error("Get thread messages error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// app/api/messages/threads/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest, getAuthSession } from "@/lib/auth"

// 🔑 Unified auth helper
async function getAuthUser(request: NextRequest) {
  // 1️⃣ Try JWT (manual login)
  const jwtUser = await getUserFromRequest(request)
  if (jwtUser) return jwtUser

  // 2️⃣ Try NextAuth (Google login)
  const session = await getAuthSession()
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, email: true, username: true, user_type: true },
    })
    if (dbUser) {
      return {
        user_id: dbUser.user_id,
        email: dbUser.email,
        name: dbUser.username,
        user_type: dbUser.user_type,
      }
    }
  }
  return null
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await ctx.params
    const threadId = Number(id)
    if (!Number.isFinite(threadId)) {
      return NextResponse.json({ error: "Invalid thread id" }, { status: 400 })
    }

    // ✅ FIX: exclude PostGIS geometry columns ("location")
    const thread = await prisma.messageThread.findUnique({
      where: { thread_id: threadId },
      include: {
        barter: {
          include: {
            listing: {
              select: {
                item_id: true,
                title: true,
                description: true,
                category: true,
                type: true,
                photos: true,
                user_id: true,
                location_text: true,
                created_at: true,
              },
            },
          },
        },
        listing: {
          select: {
            item_id: true,
            title: true,
            description: true,
            category: true,
            type: true,
            photos: true,
            user_id: true,
            location_text: true,
            created_at: true,
          },
        },
        user1: { select: { user_id: true, username: true, avatar_url: true } },
        user2: { select: { user_id: true, username: true, avatar_url: true } },
        messages: {
          orderBy: { created_at: "asc" },
          include: {
            sender: { select: { user_id: true, username: true, avatar_url: true } },
          },
        },
      },
    })

    if (
      !thread ||
      (thread.user1_id !== Number(user.user_id) &&
        thread.user2_id !== Number(user.user_id))
    ) {
      return NextResponse.json(
        { error: "Thread not found or access denied" },
        { status: 404 }
      )
    }

    // ✅ Flattened response for frontend
    return NextResponse.json({
      thread: {
        id: thread.thread_id,
        barter_id: thread.barter_id ?? null,
        listing_id: thread.listing_id ?? null,
        listing_title:
          thread.listing?.title ?? thread.barter?.listing?.title ?? "",
        listing_type:
          thread.listing?.type ?? thread.barter?.listing?.type ?? "item",
        listing_photos:
          thread.listing?.photos ?? thread.barter?.listing?.photos ?? [],
        barter_status: thread.barter?.status ?? "pending",
        user_1_id: String(thread.user1.user_id),
        user_1_name: thread.user1.username,
        user_1_avatar: thread.user1.avatar_url,
        user_2_id: String(thread.user2.user_id),
        user_2_name: thread.user2.username,
        user_2_avatar: thread.user2.avatar_url,
        last_message: thread.last_message,
        last_message_at: thread.last_message_at,
        last_message_sender_id: thread.last_message_sender_id,
        created_at: thread.created_at,
      },
      messages: thread.messages.map((m) => ({
        id: String(m.message_id),
        thread_id: m.thread_id,
        sender_id: String(m.sender_id),
        sender_name: m.sender?.username ?? "Anonymous",
        sender_avatar: m.sender?.avatar_url ?? null,
        content: m.content,
        created_at: m.created_at,
        is_read: false,
      })),
    })
  } catch (error) {
    console.error("❌ Get thread messages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
