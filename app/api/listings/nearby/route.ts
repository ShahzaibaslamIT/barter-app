// // app/api/listings/nearby/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const latitude = Number(searchParams.get("latitude"));
//     const longitude = Number(searchParams.get("longitude"));
//     const radiusKm = Number(searchParams.get("radius") || 10);
//     const type = searchParams.get("type");

//     if (!latitude || !longitude) {
//       return NextResponse.json(
//         { error: "Latitude and longitude required" },
//         { status: 400 }
//       );
//     }

//     const listings = await prisma.$queryRawUnsafe<any[]>(`
//       SELECT
//         l.item_id,
//         l.title,
//         l.description,
//         l.category,
//         l.photos,
//         l.type,
//         l.location_text,
//         l.created_at,
//         u.user_id,
//         u.username AS user_name,
//         u.avatar_url AS user_avatar,

//         ST_Distance(
//           l.location,
//           ST_SetSRID(
//             ST_MakePoint(
//               ${longitude}::double precision,
//               ${latitude}::double precision
//             ),
//             4326
//           )::geography
//         ) / 1000 AS distance_km

//       FROM "Listing" l
//       JOIN "User" u ON u.user_id = l.user_id

//       WHERE l.is_active = true
//         AND l.location IS NOT NULL
//         AND ST_DWithin(
//           l.location,
//           ST_SetSRID(
//             ST_MakePoint(
//               ${longitude}::double precision,
//               ${latitude}::double precision
//             ),
//             4326
//           )::geography,
//           ${radiusKm * 1000}
//         )
//         ${type ? `AND l.type = '${type}'` : ""}

//       ORDER BY distance_km ASC
//       LIMIT 20;
//     `);

//     return NextResponse.json({ listings });
//   } catch (err) {
//     console.error("Nearby listings error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch nearby listings" },
//       { status: 500 }
//     );
//   }
// }


// app/api/listings/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || "";
    const latitude = Number(searchParams.get("latitude"));
    const longitude = Number(searchParams.get("longitude"));
    const radiusKm = Number(searchParams.get("radius") || 10);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("q");

    // "All Pakistan" mode — no city or radius filter
    const isAllMode = city.trim().toLowerCase() === "__all__";
    // City mode requires neither lat nor lng — skip radius filter
    const isCityMode = !isAllMode && city.trim() !== "";

    if (!isAllMode && !isCityMode && (!latitude || !longitude)) {
      return NextResponse.json(
        { error: "Latitude and longitude required" },
        { status: 400 }
      );
    }

    // Build parameterized filters
    const params: any[] = [];
    let paramIndex = 1;

    // Helper to add a parameter and return its placeholder
    const addParam = (value: any): string => {
      params.push(value);
      return `$${paramIndex++}`;
    };

    let typeFilter = "";
    let categoryFilter = "";
    let searchFilter = "";
    let cityFilter = "";

    if (type) {
      typeFilter = `AND l.type = ${addParam(type)}::"ListingType"`;
    }

    if (category && category !== "All") {
      categoryFilter = `AND l.category = ${addParam(category)}`;
    }

    if (searchQuery) {
      const likePattern = `%${searchQuery}%`;
      const p1 = addParam(likePattern);
      const p2 = addParam(likePattern);
      searchFilter = `AND (l.title ILIKE ${p1} OR l.description ILIKE ${p2})`;
    }

    if (isCityMode) {
      const cityPattern = `%${city}%`;
      const p1 = addParam(cityPattern);
      const p2 = addParam(cityPattern);
      // Match on city_name (precise) OR fall back to location_text substring (old listings)
      cityFilter = `AND (
        (l.city_name IS NOT NULL AND l.city_name ILIKE ${p1})
        OR (l.city_name IS NULL AND l.location_text ILIKE ${p2})
      )`;
    }

    let listings: any[];

    if (isAllMode || isCityMode) {
      // All Pakistan / City mode — no PostGIS radius
      listings = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          l.item_id,
          l.user_id,
          l.title,
          l.description,
          l.category,
          l.condition,
          l.photos,
          l.type,
          l.latitude,
          l.longitude,
          l.location_text,
          l.barter_request,
          l.created_at,
          u.username AS user_name,
          u.avatar_url AS user_avatar,
          COALESCE(u.rating, 0) AS user_rating,
          COALESCE(u.rating_count, 0) AS user_rating_count,
          NULL::double precision AS distance_km
        FROM "Listing" l
        JOIN "User" u ON u.user_id = l.user_id
        WHERE l.is_active = true
          ${cityFilter}
          ${typeFilter}
          ${categoryFilter}
          ${searchFilter}
        ORDER BY l.created_at DESC
        LIMIT 100;
      `, ...params);
    } else {
      // Radius mode — PostGIS ST_DWithin
      // Add geo params after the filter params
      const lngParam1 = addParam(longitude);
      const latParam1 = addParam(latitude);
      const lngParam2 = addParam(longitude);
      const latParam2 = addParam(latitude);
      const radiusParam = addParam(radiusKm * 1000);

      listings = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          l.item_id,
          l.user_id,
          l.title,
          l.description,
          l.category,
          l.condition,
          l.photos,
          l.type,
          l.latitude,
          l.longitude,
          l.location_text,
          l.barter_request,
          l.created_at,
          u.username AS user_name,
          u.avatar_url AS user_avatar,
          COALESCE(u.rating, 0) AS user_rating,
          COALESCE(u.rating_count, 0) AS user_rating_count,
          ST_Distance(
            l.location::geography,
            ST_SetSRID(
              ST_MakePoint(
                ${lngParam1}::double precision,
                ${latParam1}::double precision
              ),
              4326
            )::geography
          ) / 1000 AS distance_km
        FROM "Listing" l
        JOIN "User" u ON u.user_id = l.user_id
        WHERE l.is_active = true
          AND l.location IS NOT NULL
          AND ST_DWithin(
            l.location::geography,
            ST_SetSRID(
              ST_MakePoint(
                ${lngParam2}::double precision,
                ${latParam2}::double precision
              ),
              4326
            )::geography,
            ${radiusParam}
          )
          ${typeFilter}
          ${categoryFilter}
          ${searchFilter}
        ORDER BY distance_km ASC
        LIMIT 100;
      `, ...params);
    }

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("❌ Nearby listings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch nearby listings" },
      { status: 500 }
    );
  }
}