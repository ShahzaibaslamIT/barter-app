// export const runtime = "nodejs"

// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- GET (one listing) -------------------
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }   // ✅ correct params type
// ) {
//   try {
//     const { id } = params
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const listing = await prisma.listing.findUnique({
//       where: { item_id: Number(id) },
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             user_type: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     if (!listing || !listing.is_active) {
//       return NextResponse.json({ error: "Listing not found" }, { status: 404 })
//     }

//     return NextResponse.json({ listing })
//   } catch (error: any) {
//     console.error("[listing GET by ID] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- PUT (update listing) -------------------
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }   // ✅ correct params type
// ) {
//   try {
//     const { id } = params
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const user = getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const data = await request.json()

//     const updated = await prisma.listing.updateMany({
//       where: { item_id: Number(id), user_id: Number(user.user_id) },
//       data,
//     })

//     if (updated.count === 0) {
//       return NextResponse.json(
//         { error: "Listing not found or unauthorized" },
//         { status: 404 }
//       )
//     }

//     const listing = await prisma.listing.findUnique({
//       where: { item_id: Number(id) },
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             user_type: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json({ listing })
//   } catch (error: any) {
//     console.error("[listing UPDATE] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- DELETE (soft or hard delete) -------------------
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }   // ✅ correct params type
// ) {
//   try {
//     const { id } = params
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const user = getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const hardDelete = new URL(request.url).searchParams.get("hard") === "true"

//     if (hardDelete) {
//       // ⚡ Hard delete (permanent)
//       const result = await prisma.listing.deleteMany({
//         where: {
//           item_id: Number(id),
//           user_id: Number(user.user_id),
//         },
//       })

//       if (result.count === 0) {
//         return NextResponse.json(
//           { error: "Listing not found or unauthorized" },
//           { status: 404 }
//         )
//       }

//       return NextResponse.json({ message: "Listing permanently deleted" })
//     } else {
//       // 📝 Soft delete (mark inactive)
//       const result = await prisma.listing.updateMany({
//         where: {
//           item_id: Number(id),
//           user_id: Number(user.user_id),
//         },
//         data: { is_active: false },
//       })

//       if (result.count === 0) {
//         return NextResponse.json(
//           { error: "Listing not found or unauthorized" },
//           { status: 404 }
//         )
//       }

//       return NextResponse.json({ message: "Listing deleted successfully" })
//     }
//   } catch (error: any) {
//     console.error("[listing DELETE] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- OPTIONS (preflight) -------------------
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


// export const runtime = "nodejs"

// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getUserFromRequest } from "@/lib/auth"

// // ------------------- GET (one listing) -------------------
// export async function GET(
//   request: NextRequest,
//   ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
// ) {
//   try {
//     const { id } = await ctx.params   // ✅ must await
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const listing = await prisma.listing.findUnique({
//       where: { item_id: Number(id) },
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             user_type: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     if (!listing || !listing.is_active) {
//       return NextResponse.json({ error: "Listing not found" }, { status: 404 })
//     }

//     return NextResponse.json({ listing })
//   } catch (error: any) {
//     console.error("[listing GET by ID] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- PUT (update listing) -------------------
// export async function PUT(
//   request: NextRequest,
//   ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
// ) {
//   try {
//     const { id } = await ctx.params   // ✅ must await
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const data = await request.json()

//     const updated = await prisma.listing.updateMany({
//       where: { item_id: Number(id), user_id: Number(user.user_id) },
//       data,
//     })

//     if (updated.count === 0) {
//       return NextResponse.json(
//         { error: "Listing not found or unauthorized" },
//         { status: 404 }
//       )
//     }

//     const listing = await prisma.listing.findUnique({
//       where: { item_id: Number(id) },
//       include: {
//         user: {
//           select: {
//             username: true,
//             email: true,
//             user_type: true,
//             avatar_url: true,
//             rating: true,
//             rating_count: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json({ listing })
//   } catch (error: any) {
//     console.error("[listing UPDATE] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- DELETE (soft or hard delete) -------------------
// export async function DELETE(
//   request: NextRequest,
//   ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
// ) {
//   try {
//     const { id } = await ctx.params   // ✅ must await
//     if (!id || id === "undefined") {
//       return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
//     }

//     const user = await getUserFromRequest(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const hardDelete = new URL(request.url).searchParams.get("hard") === "true"

//     if (hardDelete) {
//       // ⚡ Hard delete (permanent)
//       const result = await prisma.listing.deleteMany({
//         where: {
//           item_id: Number(id),
//           user_id: Number(user.user_id),
//         },
//       })

//       if (result.count === 0) {
//         return NextResponse.json(
//           { error: "Listing not found or unauthorized" },
//           { status: 404 }
//         )
//       }

//       return NextResponse.json({ message: "Listing permanently deleted" })
//     } else {
//       // 📝 Soft delete (mark inactive)
//       const result = await prisma.listing.updateMany({
//         where: {
//           item_id: Number(id),
//           user_id: Number(user.user_id),
//         },
//         data: { is_active: false },
//       })

//       if (result.count === 0) {
//         return NextResponse.json(
//           { error: "Listing not found or unauthorized" },
//           { status: 404 }
//         )
//       }

//       return NextResponse.json({ message: "Listing deleted successfully" })
//     }
//   } catch (error: any) {
//     console.error("[listing DELETE] error:", error?.message, error)
//     return NextResponse.json(
//       { error: error?.message || "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// // ------------------- OPTIONS (preflight) -------------------
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }

export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

// ------------------- GET (one listing) -------------------
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
) {
  try {
    const { id } = await ctx.params   // ✅ must await
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
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

// ------------------- PUT (update listing) -------------------
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
) {
  try {
    const { id } = await ctx.params   // ✅ must await
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const itemId = Number(id)
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      title,
      description,
      category,
      barter_request,
      condition,
      location_text,
      photos,
      latitude,
      longitude,
    } = body

    // 1️⃣ Make sure listing exists & belongs to this user
    const existing = await prisma.listing.findUnique({
      where: { item_id: itemId },
      select: { user_id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (Number(existing.user_id) !== Number(user.user_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2️⃣ Build a safe data object (only allow certain fields to be updated)
    const data: any = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (category !== undefined) data.category = category
    if (barter_request !== undefined) data.barter_request = barter_request
    if (condition !== undefined) data.condition = condition
    if (location_text !== undefined) data.location_text = location_text
    if (photos !== undefined) data.photos = photos
    if (latitude !== undefined) data.latitude = latitude
    if (longitude !== undefined) data.longitude = longitude

    // 3️⃣ Update main record
    const updatedListing = await prisma.listing.update({
      where: { item_id: itemId },
      data,
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

    // 4️⃣ If lat/lng provided, also update PostGIS geometry
    if (latitude !== undefined && longitude !== undefined) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Listing"
        SET location = ST_SetSRID(
          ST_MakePoint(
            ${Number(longitude)}::double precision,
            ${Number(latitude)}::double precision
          ),
          4326
        )
        WHERE item_id = ${itemId};
      `)
    }

    return NextResponse.json({ listing: updatedListing })
  } catch (error: any) {
    console.error("[listing UPDATE] error:", error?.message, error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// ------------------- DELETE (soft or hard delete) -------------------
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }   // ✅ params is a Promise
) {
  try {
    const { id } = await ctx.params   // ✅ must await
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hardDelete = new URL(request.url).searchParams.get("hard") === "true"

    if (hardDelete) {
      // ⚡ Hard delete (permanent)
      const result = await prisma.listing.deleteMany({
        where: {
          item_id: Number(id),
          user_id: Number(user.user_id),
        },
      })

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Listing not found or unauthorized" },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: "Listing permanently deleted" })
    } else {
      // 📝 Soft delete (mark inactive)
      const result = await prisma.listing.updateMany({
        where: {
          item_id: Number(id),
          user_id: Number(user.user_id),
        },
        data: { is_active: false },
      })

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Listing not found or unauthorized" },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: "Listing deleted successfully" })
    }
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

