import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "ID pengguna diperlukan." }, { status: 400 });
    }

    const { client: admin, error: adminErr } = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: adminErr || "Service role tidak tersedia." },
        { status: 503 }
      );
    }

    // 1. Reset affiliate fields in public.users table
    const { error: dbError } = await admin
      .from("users")
      .update({
        is_affiliate: false,
        affiliate_status: "none",
        affiliate_code: null,
        affiliate_phone: null,
        affiliate_social: null,
        affiliate_nik: null,
        affiliate_ktp_name: null,
      })
      .eq("id_user", userId);

    if (dbError) {
      console.error("Failed to reset affiliate status in DB by admin:", dbError);
      return NextResponse.json(
        { error: `Gagal memperbarui profil pengguna: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 2. Delete related affiliate data (clicks, saldo, penarikan)
    await Promise.all([
      admin.from("saldo_affiliate").delete().eq("id_user", userId),
      admin.from("penarikan_komisi").delete().eq("id_user", userId),
      admin.from("affiliate_clicks").delete().eq("id_user", userId),
    ]);

    // 3. Send notification to user
    await admin.from("notifikasi").insert({
      id_user: userId,
      judul: "Kemitraan Affiliate Dihapus",
      pesan: "Status kemitraan affiliate Anda telah dihapus secara permanen oleh admin. Semua saldo komisi dan riwayat klik rujukan Anda telah dibersihkan.",
      tipe: "info",
      link: "/affiliate",
      is_read: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin delete affiliate error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menghapus akun affiliate." },
      { status: 500 }
    );
  }
}
