export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- GET (listings) -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const type = searchParams.get("type") || undefined
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100)
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

    const sort = (searchParams.get("sort") || "recent").toLowerCase()
    const orderBy =
      sort === "oldest"
        ? { created_at: "asc" as const }
        : { created_at: "desc" as const }

    const where: any = { is_active: true }
    if (category) where.category = category
    if (type) where.type = type

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            avatar_url: true,
            rating: true,
            rating_count: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy,
    })

    return NextResponse.json({ listings, hasMore: listings.length === limit })
  } catch (error) {
    console.error("[listings GET] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- POST (create listing) -------------------
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request)
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized: please log in" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      category,
      barter_request,
      photos = [],
      condition,
      availability,
      latitude,
      longitude,
      location_text,
    } = body || {}

    if (!type || !title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        user_id: Number(authUser.id),
        type,
        title: String(title).trim(),
        description: String(description).trim(),
        category: String(category).trim(),
        barter_request: barter_request ?? null,
        photos: Array.isArray(photos) ? photos : [],
        condition: condition ?? null,
        availability: availability ?? null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        location_text: location_text ?? null,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            avatar_url: true,
            rating: true,
            rating_count: true,
          },
        },
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error("[listings POST] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
