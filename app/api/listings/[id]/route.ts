export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- GET (one listing) -------------------
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params // ✅ await params
    const listing = await prisma.listing.findUnique({
      where: { item_id: Number(id) },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            user_type: true,
            avatar_url: true,
            rating: true,
            rating_count: true,
          },
        },
      },
    })

    if (!listing || !listing.is_active) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error: any) {
    console.error("[listing GET by ID] error:", error?.message, error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- PUT (update) -------------------
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params // ✅ await params
    const user = getUserFromRequest(request)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await request.json()

    const updated = await prisma.listing.updateMany({
      where: { item_id: Number(id), user_id: Number(user.id) },
      data,
    })

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { item_id: Number(id) },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            user_type: true,
            avatar_url: true,
            rating: true,
            rating_count: true,
          },
        },
      },
    })

    return NextResponse.json({ listing })
  } catch (error: any) {
    console.error("[listing UPDATE] error:", error?.message, error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- DELETE (soft delete) -------------------
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params // ✅ await params
    const user = getUserFromRequest(request)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const deleted = await prisma.listing.updateMany({
      where: { item_id: Number(id), user_id: Number(user.id) },
      data: { is_active: false },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error: any) {
    console.error("[listing DELETE] error:", error?.message, error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- OPTIONS (preflight) -------------------
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
