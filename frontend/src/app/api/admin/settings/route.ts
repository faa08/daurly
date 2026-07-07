import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const fs = require('fs');
  const path = require('path');

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    try {
      fs.writeFileSync(
        path.join(process.cwd(), 'error-api.txt'),
        `requireAdmin failed: ok=false, status=${auth.response.status}`
      );
    } catch (e) {}
    return auth.response;
  }

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
      try {
        fs.writeFileSync(
          path.join(process.cwd(), 'error-api.txt'),
          `database error system_settings: ${error.message}`
        );
      } catch (e) {}
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, maintenance });
  } catch (err: any) {
    try {
      fs.writeFileSync(
        path.join(process.cwd(), 'error-api.txt'),
        `exception in settings route: ${err.message || 'unknown'}\nStack: ${err.stack || 'none'}`
      );
    } catch (e) {}
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
