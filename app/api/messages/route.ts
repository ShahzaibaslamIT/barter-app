// // app/api/messages/route.ts
// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest, getAuthSession } from "@/lib/auth"

// // 🔑 Unified auth resolver
// async function getAuthUser(request: NextRequest) {
//   const jwtUser = await getUserFromRequest(request)
//   if (jwtUser) return jwtUser

//   const session = await getAuthSession()
//   if (session?.user?.email) {
//     const dbUser = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       select: { user_id: true, email: true, username: true, user_type: true },
//     })
//     if (dbUser) {
//       return {
//         user_id: dbUser.user_id,
//         email: dbUser.email,
//         name: dbUser.username,
//         user_type: dbUser.user_type,
//       }
//     }
//   }
//   return null
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getAuthUser(request)
//     if (!user)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

//     const { thread_id, content } = await request.json()
//     if (!thread_id || !content?.trim())
//       return NextResponse.json({ error: "Thread ID and content are required" }, { status: 400 })

//     const thread = await prisma.messageThread.findUnique({
//       where: { thread_id: Number(thread_id) },
//     })

//     if (
//       !thread ||
//       (thread.user1_id !== Number(user.user_id) &&
//         thread.user2_id !== Number(user.user_id))
//     )
//       return NextResponse.json({ error: "Thread not found or access denied" }, { status: 404 })

//     // ✅ Prevent accidental double-message (same content within 3 sec)
//     const recent = await prisma.message.findFirst({
//       where: {
//         thread_id: Number(thread_id),
//         sender_id: Number(user.user_id),
//         content: content.trim(),
//       },
//       orderBy: { created_at: "desc" },
//     })

//     if (recent && Date.now() - new Date(recent.created_at).getTime() < 3000) {
//       return NextResponse.json({ message: recent }, { status: 200 })
//     }

//     const message = await prisma.message.create({
//       data: {
//         thread_id: Number(thread_id),
//         sender_id: Number(user.user_id),
//         content: content.trim(),
//       },
//       include: {
//         sender: { select: { user_id: true, username: true, avatar_url: true } },
//       },
//     })

//     return NextResponse.json({ message }, { status: 201 })
//   } catch (error) {
//     console.error("Send message error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



// app/api/messages/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, getAuthSession } from "@/lib/auth";

async function getAuthUser(request: NextRequest) {
  const jwtUser = await getUserFromRequest(request);
  if (jwtUser) return jwtUser;

  const session = await getAuthSession();
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, email: true, username: true, user_type: true },
    });
    if (dbUser) {
      return {
        user_id: dbUser.user_id,
        email: dbUser.email,
        name: dbUser.username,
        user_type: dbUser.user_type,
      };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const { thread_id, content } = await request.json();
    if (!thread_id || !content?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: "Thread ID and content are required" }),
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const thread = await prisma.messageThread.findUnique({
      where: { thread_id: Number(thread_id) },
      select: { thread_id: true, user1_id: true, user2_id: true },
    });

    if (
      !thread ||
      (thread.user1_id !== Number(user.user_id) &&
        thread.user2_id !== Number(user.user_id))
    ) {
      return new NextResponse(
        JSON.stringify({ error: "Thread not found or access denied" }),
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Prevent accidental double send (same content within 3s)
    const recent = await prisma.message.findFirst({
      where: {
        thread_id: Number(thread_id),
        sender_id: Number(user.user_id),
        content: content.trim(),
      },
      orderBy: { created_at: "desc" },
    });
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 3000) {
      return new NextResponse(JSON.stringify({ message: recent }), {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    // ✅ Create message and update thread metadata atomically
    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          thread_id: Number(thread_id),
          sender_id: Number(user.user_id),
          content: content.trim(),
        },
        include: {
          sender: {
            select: { user_id: true, username: true, avatar_url: true },
          },
        },
      });

      await tx.messageThread.update({
        where: { thread_id: Number(thread_id) },
        data: {
          last_message: message.content,
          last_message_sender_id: Number(user.user_id),
          last_message_at: message.created_at,
        },
      });

      return message;
    });

    return new NextResponse(JSON.stringify({ message: result }), {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
