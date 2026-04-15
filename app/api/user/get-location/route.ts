import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Coordinates are required" }, { status: 400 });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          // Good job on the User-Agent! It's essential for OSM.
          "User-Agent": "skillcirqle/1.0 (kristaldev001@gmail.com)",
        },
        // Cache the result for a bit to save on API calls
        next: { revalidate: 3600 } 
      },
    );

    if (!response.ok) {
      throw new Error(`OSM responded with ${response.status}`);
    }

    const data = await response.json();
    const addr = data?.address;

    // nominatim can be inconsistent with keys depending on the region
    const country = addr?.country;
    const state = addr?.state || addr?.province || addr?.region || addr?.county;
    const city = addr?.city || addr?.town || addr?.village || addr?.suburb;

    return NextResponse.json({ 
      country, 
      state, 
      city,
      displayName: data?.display_name 
    });
    
  } catch (error: any) {
    console.error("🔴 Geocoding Error:", error.message);
    return NextResponse.json(
      { error: "Failed to resolve location" },
      { status: 500 },
    );
  }
}