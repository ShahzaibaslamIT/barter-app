import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 params is a Promise
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Await params
    const { id } = await context.params

    // ✅ Ensure user only sees their own listings
    if (Number(id) !== Number(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const listings = await prisma.listing.findMany({
      where: {
        user_id: Number(user.id),
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
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Get user listings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
