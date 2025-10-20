// // app/api/listings/route.ts
// export const runtime = "nodejs"

// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- GET (listings) -------------------
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const category = searchParams.get("category") || undefined
//     const type = searchParams.get("type") || undefined
//     const limit = Math.min(Number(searchParams.get("limit") || 20), 100)
//     const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

//     const sort = (searchParams.get("sort") || "recent").toLowerCase()
//     const orderBy =
//       sort === "oldest"
//         ? { created_at: "asc" as const }
//         : { created_at: "desc" as const }

//     const where: any = { is_active: true }
//     if (category) where.category = category
//     if (type) where.type = type

//     const listings = await prisma.listing.findMany({
//       where,
//       include: {
//         user: {
//           select: {
//             user_id: true,
//             username: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//       take: limit,
//       skip: offset,
//       orderBy,
//     })

//     return NextResponse.json({ listings, hasMore: listings.length === limit })
//   } catch (error) {
//     console.error("[listings GET] error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- POST (create listing) -------------------
// export async function POST(request: NextRequest) {
//   try {
//     const authUser = getUserFromRequest(request)
//     console.log("🔑 Auth user from request:", authUser)

//     if (!authUser?.email) {
//       return NextResponse.json({ error: "Unauthorized: missing email in token" }, { status: 401 })
//     }

//     // ✅ Always resolve user_id from DB
//     const dbUser = await prisma.user.findUnique({
//       where: { email: authUser.email },
//       select: { user_id: true },
//     })

//     if (!dbUser) {
//       return NextResponse.json(
//         { error: "User not found in database" },
//         { status: 404 }
//       )
//     }

//     const userId = dbUser.user_id

//     const body = await request.json()
//     const {
//       type,
//       title,
//       description,
//       category,
//       barter_request,
//       photos = [],
//       condition,
//       availability,
//       latitude,
//       longitude,
//       location_text,
//     } = body || {}

//     if (!type || !title || !description || !category) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     const listing = await prisma.listing.create({
//       data: {
//         user_id: userId, // ✅ now always valid FK
//         type,
//         title: String(title).trim(),
//         description: String(description).trim(),
//         category: String(category).trim(),
//         barter_request: barter_request ?? null,
//         photos: Array.isArray(photos) ? photos : [],
//         condition: condition ?? null,
//         availability: availability ?? null,
//         latitude: latitude ? Number(latitude) : null,
//         longitude: longitude ? Number(longitude) : null,
//         location_text: location_text ?? null,
//       },
//       include: {
//         user: {
//           select: {
//             user_id: true,
//             username: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     console.log("✅ Created listing:", listing.item_id, "for DB user:", userId)
//     return NextResponse.json({ listing }, { status: 201 })
//   } catch (error) {
//     console.error("[listings POST] error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- OPTIONS (preflight) -------------------
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


// export const runtime = "nodejs"

// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- GET (listings) -------------------
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const category = searchParams.get("category") || undefined
//     const type = searchParams.get("type") || undefined
//     const limit = Math.min(Number(searchParams.get("limit") || 20), 100)
//     const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

//     const sort = (searchParams.get("sort") || "recent").toLowerCase()
//     const orderBy =
//       sort === "oldest"
//         ? { created_at: "asc" as const }
//         : { created_at: "desc" as const }

//     const where: any = { is_active: true }
//     if (category) where.category = category
//     if (type) where.type = type

//     const listings = await prisma.listing.findMany({
//       where,
//       include: {
//         user: {
//           select: {
//             user_id: true,
//             username: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//       take: limit,
//       skip: offset,
//       orderBy,
//     })

//     return NextResponse.json({ listings, hasMore: listings.length === limit })
//   } catch (error) {
//     console.error("[listings GET] error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- POST (create listing) -------------------
// export async function POST(request: NextRequest) {
//   try {
//     const authUser =await getUserFromRequest(request)
//     console.log("🔑 Auth user from request:", authUser)

//     if (!authUser?.email) {
//       return NextResponse.json({ error: "Unauthorized: missing email in token" }, { status: 401 })
//     }

//     // ✅ Always resolve user_id from DB
//     const dbUser = await prisma.user.findUnique({
//       where: { email: authUser.email },
//       select: { user_id: true },
//     })

//     if (!dbUser) {
//       return NextResponse.json(
//         { error: "User not found in database" },
//         { status: 404 }
//       )
//     }

//     const userId = dbUser.user_id

//     const body = await request.json()
//     const {
//       type,
//       title,
//       description,
//       category,
//       barter_request,
//       photos = [],
//       condition,
//       availability,
//       latitude,
//       longitude,
//       location_text,
//     } = body || {}

//     if (!type || !title || !description || !category) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     // ✅ Step 1: create with Prisma
//     const listing = await prisma.listing.create({
//       data: {
//         user_id: userId,
//         type,
//         title: String(title).trim(),
//         description: String(description).trim(),
//         category: String(category).trim(),
//         barter_request: barter_request ?? null,
//         photos: Array.isArray(photos) ? photos : [],
//         condition: condition ?? null,
//         availability: availability ?? null,
//         latitude: latitude ? Number(latitude) : null,
//         longitude: longitude ? Number(longitude) : null,
//         location_text: location_text ?? null,
//         is_active: true,
//       },
//     })

//     // ✅ Step 2: if lat/lon exist, update PostGIS location
//     if (latitude && longitude) {
//       await prisma.$executeRawUnsafe(`
//         UPDATE "Listing"
//         SET location = ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
//         WHERE item_id = ${listing.item_id};
//       `)
//     }

//     // ✅ Return listing (with user info)
//     const updated = await prisma.listing.findUnique({
//       where: { item_id: listing.item_id },
//       include: {
//         user: {
//           select: {
//             user_id: true,
//             username: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     console.log("✅ Created listing with location:", updated?.item_id)
//     return NextResponse.json({ listing: updated }, { status: 201 })
//   } catch (error) {
//     console.error("[listings POST] error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// // ------------------- OPTIONS (preflight) -------------------
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


// 

// ✅ app/api/listings/route.ts
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- GET (fetch listings) -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const type = searchParams.get("type") || undefined
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100)
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0)

    const sort = (searchParams.get("sort") || "recent").toLowerCase()
    const orderBy =
      sort === "oldest" ? { created_at: "asc" as const } : { created_at: "desc" as const }

    const where: any = { is_active: true }
    if (category) where.category = category
    if (type) where.type = type

    // ✅ Only fetch scalar fields — not geometry
    const listings = await prisma.listing.findMany({
      where,
      select: {
        item_id: true,
        title: true,
        description: true,
        category: true,
        condition: true,
        latitude: true,
        longitude: true,
        location_text: true,
        type: true,
        created_at: true,
        expires_at: true,
        listing_fee_usd: true,
        photos: true,
        barter_request: true,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ------------------- POST (create listing) -------------------
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request)
    console.log("🔑 Auth user from request:", authUser)

    if (!authUser?.email && !authUser?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Ensure user exists in DB
    let dbUser = null
    if (authUser?.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: { user_id: true },
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: authUser.email,
            username: authUser.name || authUser.email.split("@")[0],
            password_hash: "google-oauth",
            user_type: "both",
          },
          select: { user_id: true },
        })
      }
    }

    const userId = dbUser?.user_id || Number(authUser.user_id)
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "User not found or invalid" }, { status: 404 })
    }

    // ✅ Fetch listing settings
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } })
    const fee_usd = settings?.listing_fee_usd || 0.99
    const expiry_days = settings?.listing_expiry_days || 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiry_days)

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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // ✅ Create listing (excluding geometry column to avoid Prisma error)
    const listing = await prisma.listing.create({
      data: {
        user_id: userId,
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
        is_active: true,
        listing_fee_usd: fee_usd,
        expires_at: expiresAt,
      },
      select: {
        item_id: true,
        user_id: true,
        title: true,
        type: true,
        latitude: true,
        longitude: true,
        location_text: true,
      },
    })

    // ✅ Update PostGIS geometry using SQL directly
    if (latitude && longitude) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Listing"
        SET location = ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
        WHERE item_id = ${listing.item_id};
      `)
    }

    // ✅ Return enriched listing with user info
    const updated = await prisma.listing.findUnique({
      where: { item_id: listing.item_id },
      select: {
        item_id: true,
        title: true,
        type: true,
        category: true,
        latitude: true,
        longitude: true,
        location_text: true,
        listing_fee_usd: true,
        expires_at: true,
        photos: true,
        barter_request: true,
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

    console.log("✅ Listing created successfully:", updated?.item_id)
    return NextResponse.json({ listing: updated }, { status: 201 })
  } catch (error) {
    console.error("[listings POST] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ------------------- OPTIONS (CORS preflight) -------------------
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
