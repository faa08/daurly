import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { client: admin } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ maintenance: false });
  }

  try {
    const { data, error } = await admin
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ maintenance: false });
    }

    return NextResponse.json({ maintenance: data.value === true || data.value === "true" });
  } catch (err) {
    return NextResponse.json({ maintenance: false });
  }
}
