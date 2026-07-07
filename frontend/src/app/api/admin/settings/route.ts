import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { maintenance } = body;

    if (maintenance === undefined) {
      return NextResponse.json({ error: "Nilai maintenance tidak valid" }, { status: 400 });
    }

    const { admin } = auth.ctx;
    
    const { error } = await admin
      .from("system_settings")
      .upsert(
        { key: "maintenance_mode", value: maintenance },
        { onConflict: "key" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, maintenance });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
