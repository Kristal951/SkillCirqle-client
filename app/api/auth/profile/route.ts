import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    let userData = null;

    if (snap.exists()) {
      userData = snap.data();
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        ...userData,
      },
    });
  } catch (err) {
    console.error("PROFILE_ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
