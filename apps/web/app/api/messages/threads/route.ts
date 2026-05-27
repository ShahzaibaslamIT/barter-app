// // app/api/messages/threads/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- GET all threads for current user -------------------
// export async function GET(request: NextRequest) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const userId = Number(user.user_id)

//     // ✅ fetch all threads where user is involved
//     const threads = await prisma.messageThread.findMany({
//       where: {
//         OR: [{ user1_id: userId }, { user2_id: userId }],
//       },
//       include: {
//         listing: { select: { title: true, type: true, photos: true } },
//         user1: { select: { user_id: true, username: true, avatar_url: true } },
//         user2: { select: { user_id: true, username: true, avatar_url: true } },
//       },
//       orderBy: { last_message_at: "desc" },
//     })

//     const formatted = threads.map((t) => {
//       const otherUser = t.user1_id === userId ? t.user2 : t.user1
//       return {
//         thread_id: t.thread_id,
//         barter_id: t.barter_id,
//         listing_title: t.listing?.title || "Untitled",
//         listing_type: t.listing?.type || "item",
//         listing_photos: t.listing?.photos || [],
//         other_user_name: otherUser?.username || "Unknown",
//         other_user_avatar: otherUser?.avatar_url || null,
//         other_user_id: otherUser?.user_id || null,
//         last_message: t.last_message,
//         last_message_time: t.last_message_at,
//         last_message_sender_id: t.last_message_sender_id,
//         unread_count: 0, // ✅ implement later if you track unread msgs
//         thread_created_at: t.created_at,
//       }
//     })

//     return NextResponse.json({ threads: formatted }, { status: 200 })
//   } catch (err) {
//     console.error("❌ Get threads error:", err)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- POST create/find thread -------------------
// export async function POST(request: NextRequest) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { listing_id, barter_id, other_user_id } = await request.json()
//     console.log("➡️ Incoming thread POST:", { listing_id, barter_id, other_user_id, user_id: user.user_id })

//     if (!listing_id && !barter_id) {
//       return NextResponse.json(
//         { error: "listing_id or barter_id required" },
//         { status: 400 }
//       )
//     }

//     const userId = Number(user.user_id)
//     const otherId = Number(other_user_id)

//     if (!Number.isFinite(userId) || !Number.isFinite(otherId)) {
//       return NextResponse.json(
//         { error: "Invalid user IDs", details: { userId, otherId } },
//         { status: 400 }
//       )
//     }

//     // ✅ find existing thread
//     let thread = await prisma.messageThread.findFirst({
//       where: {
//         listing_id: listing_id ? Number(listing_id) : undefined,
//         barter_id: barter_id ? Number(barter_id) : undefined,
//         OR: [
//           { user1_id: userId, user2_id: otherId },
//           { user1_id: otherId, user2_id: userId },
//         ],
//       },
//     })

//     if (!thread) {
//       thread = await prisma.messageThread.create({
//         data: {
//           listing_id: listing_id ? Number(listing_id) : null,
//           barter_id: barter_id ? Number(barter_id) : null,
//           user1_id: userId,
//           user2_id: otherId,
//         },
//       })
//     }

//     return NextResponse.json({ thread }, { status: 201 })
//   } catch (err) {
//     console.error("❌ Create thread error:", err)
//     return NextResponse.json(
//       { error: "Internal server error", details: String(err) },
//       { status: 500 }
//     )
//   }
// }



// app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest, getAuthSession } from "@/lib/auth"

// 🔑 Unified auth resolver (works for JWT and NextAuth)
async function getAuthUser(request: NextRequest) {
  // 1. Try JWT (manual login)
  const jwtUser = await getUserFromRequest(request)
  if (jwtUser) return jwtUser

  // 2. Try NextAuth (Google login)
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

// ------------------- GET all threads for current user -------------------
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(user.user_id)

    // ✅ fetch all threads where user is involved
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      include: {
        listing: { select: { title: true, type: true, photos: true } },
        user1: { select: { user_id: true, username: true, avatar_url: true } },
        user2: { select: { user_id: true, username: true, avatar_url: true } },
      },
      orderBy: { last_message_at: "desc" },
    })

    const formatted = threads.map((t) => {
      const otherUser = t.user1_id === userId ? t.user2 : t.user1
      return {
        thread_id: t.thread_id,
        barter_id: t.barter_id,
        listing_title: t.listing?.title || "Untitled",
        listing_type: t.listing?.type || "item",
        listing_photos: t.listing?.photos || [],
        other_user_name: otherUser?.username || "Unknown",
        other_user_avatar: otherUser?.avatar_url || null,
        other_user_id: otherUser?.user_id || null,
        last_message: t.last_message,
        last_message_time: t.last_message_at,
        last_message_sender_id: t.last_message_sender_id,
        unread_count: 0, // placeholder
        thread_created_at: t.created_at,
      }
    })

    return NextResponse.json({ threads: formatted }, { status: 200 })
  } catch (err) {
    console.error("❌ Get threads error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ------------------- POST create/find thread -------------------
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listing_id, barter_id, other_user_id } = await request.json()
    console.log("➡️ Incoming thread POST:", {
      listing_id,
      barter_id,
      other_user_id,
      user_id: user.user_id,
    })

    if (!listing_id && !barter_id) {
      return NextResponse.json(
        { error: "listing_id or barter_id required" },
        { status: 400 }
      )
    }

    const userId = Number(user.user_id)
    const otherId = Number(other_user_id)

    if (!Number.isFinite(userId) || !Number.isFinite(otherId)) {
      return NextResponse.json(
        { error: "Invalid user IDs", details: { userId, otherId } },
        { status: 400 }
      )
    }

    // ✅ find existing thread
    let thread = await prisma.messageThread.findFirst({
      where: {
        listing_id: listing_id ? Number(listing_id) : undefined,
        barter_id: barter_id ? Number(barter_id) : undefined,
        OR: [
          { user1_id: userId, user2_id: otherId },
          { user1_id: otherId, user2_id: userId },
        ],
      },
    })

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          listing_id: listing_id ? Number(listing_id) : null,
          barter_id: barter_id ? Number(barter_id) : null,
          user1_id: userId,
          user2_id: otherId,
        },
      })
    }

    return NextResponse.json({ thread }, { status: 201 })
  } catch (err) {
    console.error("❌ Create thread error:", err)
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    )
  }
}



