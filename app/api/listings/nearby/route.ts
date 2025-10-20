// // app/api/listings/nearby/route.ts
// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const latitude = parseFloat(searchParams.get("latitude") || "0")
//     const longitude = parseFloat(searchParams.get("longitude") || "0")
//     const radius = parseFloat(searchParams.get("radius") || "10") // km
//     const type = searchParams.get("type")
//     const category = searchParams.get("category")
//     const limit = parseInt(searchParams.get("limit") || "20")
//     const offset = parseInt(searchParams.get("offset") || "0")

//     if (!latitude || !longitude) {
//       return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
//     }

//     // ✅ Nearby listings query
//     const Listing =  prisma.$queryRawUnsafe<any[]>(`
//       SELECT 
//         l.item_id,
//         l.title,
//         l.description,
//         l.category,
//         l.condition,
//         l.latitude,
//         l.longitude,
//         l.photos,
//         l.barter_request,
//         l.type,
//         l.location_text,
//         l.created_at,
//         u.user_id,
//         u.username AS user_name,
//         u.avatar_url AS user_avatar,
//         ST_Distance(
//           l.location,
//           ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
//         ) / 1000 AS distance_km,
//         (
//           SELECT COALESCE(AVG(score), 0)::FLOAT 
//           FROM ratings r 
//           WHERE r.rated_user_id = l.user_id
//         ) AS user_rating,
//         (
//           SELECT COUNT(*)::INT 
//           FROM ratings r 
//           WHERE r.rated_user_id = l.user_id
//         ) AS user_rating_count
//       FROM Listing l
//       JOIN users u ON l.user_id = u.user_id
//       WHERE l.is_active = true
//         AND l.location IS NOT NULL
//         AND ST_DWithin(
//           l.location,
//           ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
//           ${radius * 1000}
//         )
//         ${type ? `AND l.type = '${type}'` : ""}
//         ${category ? `AND l.category = '${category}'` : ""}
//       ORDER BY distance_km ASC, l.created_at DESC
//       LIMIT ${limit} OFFSET ${offset};
//     `)

//     // ✅ Count query for pagination
//     const countResult = await prisma.$queryRawUnsafe<any[]>(`
//       SELECT COUNT(*)::INT AS total
//       FROM Listing l
//       WHERE l.is_active = true
//         AND l.location IS NOT NULL
//         AND ST_DWithin(
//           l.location,
//           ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
//           ${radius * 1000}
//         )
//         ${type ? `AND l.type = '${type}'` : ""}
//         ${category ? `AND l.category = '${category}'` : ""};
//     `)

//     const total = countResult?.[0]?.total || 0

//     return NextResponse.json({
//       Listing,
//       pagination: { total, limit, offset, hasMore: offset + limit < total },
//     })
//   } catch (error) {
//     console.error("❌ Error fetching nearby listings:", error)
//     return NextResponse.json({ error: "Failed to fetch nearby listings" }, { status: 500 })
//   }
// }


// app/api/listings/nearby/route.ts


// app/api/listings/nearby/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get("latitude") || "0")
    const longitude = parseFloat(searchParams.get("longitude") || "0")
    const radius = parseFloat(searchParams.get("radius") || "10") // km
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // ✅ Use "Listing" (quoted) because your table is capitalized
    const listings = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        l.item_id,
        l.title,
        l.description,
        l.category,
        l.condition,
        l.latitude,
        l.longitude,
        l.photos,
        l.barter_request,
        l.type,
        l.location_text,
        l.created_at,
        u.user_id,
        u.username AS user_name,
        u.avatar_url AS user_avatar,
        ST_Distance(
          l.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) / 1000 AS distance_km,
        (
          SELECT COALESCE(AVG(score), 0)::FLOAT 
          FROM "Rating" r 
          WHERE r.rated_user_id = l.user_id
        ) AS user_rating,
        (
          SELECT COUNT(*)::INT 
          FROM "Rating" r 
          WHERE r.rated_user_id = l.user_id
        ) AS user_rating_count
      FROM "Listing" l
      JOIN "User" u ON l.user_id = u.user_id
      WHERE l.is_active = true
        AND l.location IS NOT NULL
        AND ST_DWithin(
          l.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radius * 1000}
        )
        ${type ? `AND l.type = '${type}'` : ""}
        ${category ? `AND l.category = '${category}'` : ""}
      ORDER BY distance_km ASC, l.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `)

    const countResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::INT AS total
      FROM "Listing" l
      WHERE l.is_active = true
        AND l.location IS NOT NULL
        AND ST_DWithin(
          l.location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radius * 1000}
        )
        ${type ? `AND l.type = '${type}'` : ""}
        ${category ? `AND l.category = '${category}'` : ""};
    `)

    const total = countResult?.[0]?.total || 0

    return NextResponse.json({
      listings,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    })
  } catch (error) {
    console.error("❌ Error fetching nearby listings:", error)
    return NextResponse.json({ error: "Failed to fetch nearby listings" }, { status: 500 })
  }
}


