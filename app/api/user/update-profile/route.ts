import { adminDB } from "@/lib/firebaseAdmin";
import { getSessionUser } from "@/lib/server-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {

    const body = await req.json();

    const { updates } = body;

    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Invalid updates payload" },
        { status: 400 },
      );
    }

    const allowedFields = [
      "bio",
      "location",
      "role",
      "skillsToTeach",
      "skillsToLearn",
      "hasOnboarded",
      "avatarUrl",
    ];

    const filteredUpdates: Record<string, any> = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    if (Object.keys(filteredUpdates).length === 0) {
      console.warn("⚠️ No valid fields to update");
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 },
      );
    }

    await adminDB
      .collection("users")
      .doc(user.uid)
      .set(
        {
          ...filteredUpdates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
