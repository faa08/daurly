import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, productId } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Kode referral wajib diisi." }, { status: 400 });
    }

    const { createSupabaseAdmin } = await import("@/lib/supabase-admin");
    const { client: admin, error: adminErr } = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: adminErr || "DB tidak tersedia." }, { status: 503 });
    }

    // 1. Cari user ID dari affiliate code
    const { data: affUser, error: userErr } = await admin
      .from("users")
      .select("id_user")
      .eq("affiliate_code", code)
      .eq("is_affiliate", true)
      .maybeSingle();

    if (userErr || !affUser) {
      return NextResponse.json({ error: "Kode affiliate tidak valid." }, { status: 400 });
    }

    // 2. Catat klik di database
    const ipAddress = request.headers.get("x-forwarded-for") || null;

    const { error: clickErr } = await admin.from("affiliate_clicks").insert({
      id_user: affUser.id_user,
      id_produk: productId || null,
      ip_address: ipAddress,
    });

    if (clickErr) throw clickErr;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Record click failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal mencatat rujukan." },
      { status: 500 }
    );
  }
}
