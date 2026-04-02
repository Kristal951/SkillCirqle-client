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
      step: data?.onboardingStep ?? 1,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const step = Number(body.step);

    if (isNaN(step) || step < 1) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const userRef = adminDB.collection("users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        onboardingStep: step,
      });
    } else {
      await userRef.update({
        onboardingStep: step,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
