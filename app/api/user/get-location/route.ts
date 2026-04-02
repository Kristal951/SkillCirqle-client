import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude } = await req.json();

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent": "skillcirqle/1.0 (kristaldev001@gmail.com)",
        },
      },
    );

    const data = await response.json();

    const country = data?.address?.country;
    const state = data?.address?.state;

    return NextResponse.json({ country, state });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get location" },
      { status: 500 },
    );
  }
}
