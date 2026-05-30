// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@barter/db";
// import { getUserFromRequest } from "@/lib/auth";

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getUserFromRequest(request);

//     if (!user?.user_id) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const listings = await prisma.listing.findMany({
//       where: {
//         user_id: Number(user.user_id),
//       },
//       orderBy: {
//         created_at: "desc",
//       },
//     });

//     return NextResponse.json({ listings });
//   } catch (error) {
//     console.error("[api/listings/mine]", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }



export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@barter/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // ✅ Resolve user (JWT or NextAuth)
    const user = await getUserFromRequest(request);

    if (!user || !user.user_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const listings = await prisma.listing.findMany({
      where: {
        user_id: Number(user.user_id),
        is_active: true,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
            rating: true,
            rating_count: true,
          },
        },
      },
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("[listings/mine] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
