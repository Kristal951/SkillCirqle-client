
import { generateSkillAssets } from "@/actions/generateSkillData";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    const { id, title } = payload.record;

    if (!id || !title) {
      return NextResponse.json({ error: "Missing ID or Title" }, { status: 400 });
    }

    const result = await generateSkillAssets(id, title);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: "Success", data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}