import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  try {
    const body = await request.json().catch(() => ({}));
    const { email, phone, social, nik, ktpName } = body;

    if (!phone || !social || !nik || !ktpName) {
      return NextResponse.json(
        { error: "Mohon lengkapi semua data pendaftaran yang diperlukan." },
        { status: 400 }
      );
    }

    // 1. Cek status saat ini
    const { data: user, error: userErr } = await admin
      .from("users")
      .select("is_affiliate, affiliate_status, affiliate_code, username")
      .eq("id_user", userId)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (user.is_affiliate || user.affiliate_status === "approved") {
      return NextResponse.json({
        success: true,
        affiliate_code: user.affiliate_code,
        status: "approved",
        message: "Sudah terdaftar sebagai affiliate.",
      });
    }

    if (user.affiliate_status === "pending") {
      return NextResponse.json({
        success: true,
        status: "pending",
        message: "Pendaftaran Anda sedang ditinjau oleh admin.",
      });
    }

    // 2. Update status user menjadi pending dan simpan data registrasi
    const updatePayload: Record<string, any> = {
      affiliate_status: "pending",
      affiliate_phone: phone,
      affiliate_social: social,
      affiliate_nik: nik,
      affiliate_ktp_name: ktpName,
    };

    if (email) {
      updatePayload.email = email;
    }

    const { error: updateErr } = await admin
      .from("users")
      .update(updatePayload)
      .eq("id_user", userId);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      status: "pending",
      message: "Pendaftaran berhasil dikirim. Menunggu verifikasi admin.",
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Affiliate registration failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal mendaftar program affiliate." },
      { status: 500 }
    );
  }
}
