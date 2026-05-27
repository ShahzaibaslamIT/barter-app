// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const rawId = params?.id;
//     const userId = Number(rawId);

//     // ✅ Stronger validation
//     if (!rawId || isNaN(userId) || userId <= 0) {
//       return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { user_id: userId },
//       select: {
//         user_id: true,
//         username: true,
//         email: true,
//         phone: true,
//         avatar_url: true,
//         user_type: true,
//         // add related data
//         listings: {
//           select: {
//             item_id: true,
//             title: true,
//             type: true,
//             photos: true,
//           },
//           where: { is_active: true },
//           orderBy: { created_at: "desc" },
//           take: 8,
//         },
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Optional: compute stats placeholders
//     const response = {
//       ...user,
//       averageRating: 0,
//       totalRatings: 0,
//       activeListings: user.listings?.length || 0,
//       completedTrades: 0,
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params to avoid Next.js warning
    const { id } = await context.params;
    const userId = Number(id);

    if (!id || isNaN(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        avatar_url: true,
        user_type: true,
        listings: {
          select: {
            item_id: true,
            title: true,
            type: true,
            photos: true,
          },
          where: { is_active: true },
          orderBy: { created_at: "desc" },
          take: 8,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = {
      ...user,
      averageRating: 0,
      totalRatings: 0,
      activeListings: user.listings?.length || 0,
      completedTrades: 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

