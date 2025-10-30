// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // ✅ Await params
//     const { id } = await context.params

//     // ✅ Ensure user only sees their own listings
//     if (Number(id) !== Number(user.user_id)) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     const listings = await prisma.listing.findMany({
//       where: {
//         user_id: Number(user.user_id), // ✅ fixed
//         is_active: true,
//       },
//       select: {
//         item_id: true,
//         type: true,
//         title: true,
//         description: true,
//         category: true,
//         photos: true,
//         condition: true,
//         created_at: true,
//       },
//       orderBy: {
//         created_at: "desc",
//       },
//     })

//     return NextResponse.json({ listings })
//   } catch (error) {
//     console.error("Get user listings error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



// app/api/users/[id]/listings/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 👇 Await route params
    const { id } = await context.params
    const userId = Number(id)

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // ✅ Try to get authenticated user (optional)
    const currentUser = await getUserFromRequest(request).catch(() => null)

    // ⚙️ Public endpoint:
    // Allow viewing listings for ANY user (not just the logged-in one)
    // Logged-in users can still see their private drafts etc later if needed.
    const listings = await prisma.listing.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      select: {
        item_id: true,
        type: true,
        title: true,
        description: true,
        category: true,
        photos: true,
        condition: true,
        created_at: true,
        location_text: true,
      },
      orderBy: { created_at: "desc" },
    })

    if (!listings || listings.length === 0) {
      return NextResponse.json({ listings: [], message: "No listings found" })
    }

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("❌ Get user listings error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
