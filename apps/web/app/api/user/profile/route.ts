// export const runtime = "nodejs";

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth-options"; // adjust path if needed
// import { prisma } from "@barter/db";

// export async function PATCH(req: NextRequest) {
//   try {
//     // 🔐 Get session from NextAuth
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const {
//       country,
//       state_province,
//       city,
//       postal_code,
//       address_line1,
//       address_line2,
//     } = await req.json();

//     // 🔒 Required fields
//     if (!country || !state_province || !city) {
//       return NextResponse.json(
//         { error: "Country, state/province, and city are required." },
//         { status: 400 }
//       );
//     }

//     // ✅ Update user profile
//     await prisma.user.update({
//       where: { email: session.user.email },
//       data: {
//         country,
//         state_province,
//         city,
//         postal_code: postal_code ?? null,
//         address_line1: address_line1 ?? null,
//         address_line2: address_line2 ?? null,
//         profile_complete: true,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Profile completed successfully.",
//     });
//   } catch (err) {
//     console.error("[complete-profile] error", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@barter/db";
import { geocodeLocation } from "@/lib/geocode";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      username,
      country,
      state_province,
      city,
      postal_code,
      address_line1,
      address_line2,
    } = await req.json();

    // Validate required fields for profile completion
    if (!country || !state_province || !city) {
      return NextResponse.json(
        { error: "Country, state/province, and city are required." },
        { status: 400 }
      );
    }

    // 🌍 Geocode location
    const coords = await geocodeLocation(city, state_province, country);

    // Build location_text for display
    const location_text = `${city}, ${state_province}, ${country}`;

    // ✅ UPSERT pattern - update existing user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        username: username ?? undefined,
        country,
        state_province,
        city,
        postal_code: postal_code ?? null,
        address_line1: address_line1 ?? null,
        address_line2: address_line2 ?? null,
        location_text,

        // Store coordinates if found
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,

        // Mark profile as complete
        profile_complete: true,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
        country: true,
        state_province: true,
        city: true,
        location_text: true,
        latitude: true,
        longitude: true,
        profile_complete: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      location_geocoded: Boolean(coords),
      user: updatedUser,
    });
  } catch (err) {
    console.error("[profile-update] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
