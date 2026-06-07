import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/withRateLimiter";
import { getOrSetCache } from "@/utils/cacheHelper";

async function handler(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Coordinates are required" },
        { status: 400 },
      );
    }

    const data = await getOrSetCache(
      `geo:${latitude}:${longitude}`,
      async () => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "skillcirqle/1.0 (kristaldev001@gmail.com)",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`OSM responded with ${response.status}`);
        }

        return response.json();
      },
    );

    const addr = data?.address;

    const country = addr?.country;
    const state = addr?.state || addr?.province || addr?.region || addr?.county;

    const city = addr?.city || addr?.town || addr?.village || addr?.suburb;

    return NextResponse.json({
      country,
      state,
      city,
      displayName: data?.display_name,
    });
  } catch (error: any) {
    console.error("🔴 Geocoding Error:", error.message);

    return NextResponse.json(
      { error: "Failed to resolve location" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, handler, "geo-reverse");
}
