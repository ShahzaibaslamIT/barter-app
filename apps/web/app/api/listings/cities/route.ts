import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Returns top cities from active listings.
// New listings store city_name explicitly (clean, accurate).
// Old listings fall back to extracting from location_text:
//   4+ parts: "suburb, CITY, state, country" → take part 2
//   3 parts:  "CITY, state, country"          → take part 1
//   2 parts:  "CITY, country"                 → take part 1
export async function GET() {
  try {
    const rows = await prisma.$queryRawUnsafe<{ city: string; count: bigint }[]>(`
      SELECT
        TRIM(
          COALESCE(
            NULLIF(city_name, ''),
            CASE
              WHEN array_length(string_to_array(location_text, ','), 1) >= 4
                THEN split_part(location_text, ',', 2)
              ELSE
                split_part(location_text, ',', 1)
            END
          )
        ) AS city,
        COUNT(*) AS count
      FROM "Listing"
      WHERE
        is_active = true
        AND (
          (city_name IS NOT NULL AND city_name <> '')
          OR (location_text IS NOT NULL AND location_text <> '')
        )
      GROUP BY city
      HAVING
        COUNT(*) > 0
        AND TRIM(
          COALESCE(
            NULLIF(city_name, ''),
            CASE
              WHEN array_length(string_to_array(location_text, ','), 1) >= 4
                THEN split_part(location_text, ',', 2)
              ELSE
                split_part(location_text, ',', 1)
            END
          )
        ) <> ''
      ORDER BY count DESC
      LIMIT 20;
    `);

    const cities = rows.map((r) => ({
      city: r.city,
      count: Number(r.count),
    }));

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("Cities route error:", err);
    return NextResponse.json({ cities: [] });
  }
}
