import { adminDB } from "@/lib/firebaseAdmin";
import { getServerUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await adminDB.collection("users").doc(user.uid).get();

    if (!doc.exists) {
      return NextResponse.json({ step: 1 });
    }

    const data = doc.data();

    return NextResponse.json({
      hasOnboarded: data?.hasOnboarded || false,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
