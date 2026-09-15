import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServer();
  const { id } = await params;
  const { error } = await supabase
    .from("waitlist_signups")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
