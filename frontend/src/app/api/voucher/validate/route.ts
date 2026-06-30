import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;

  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json({ error: "Kode voucher wajib diisi." }, { status: 400 });
    }

    const { data: voucher, error } = await admin
      .from("voucher")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!voucher) {
      return NextResponse.json(
        { error: "Kode voucher tidak valid atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    if (subtotal < Number(voucher.min_purchase)) {
      return NextResponse.json(
        {
          error: `Minimal pembelian untuk menggunakan voucher ini adalah Rp ${Number(
            voucher.min_purchase
          ).toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (voucher.discount_type === "percentage") {
      discount = Math.floor(subtotal * (Number(voucher.value) / 100));
      if (Number(voucher.max_discount) > 0) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    } else if (voucher.discount_type === "fixed") {
      discount = Number(voucher.value);
    }

    // Pastikan diskon tidak melebihi subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      ok: true,
      voucher: {
        code: voucher.code,
        discount_type: voucher.discount_type,
        value: Number(voucher.value),
        max_discount: Number(voucher.max_discount),
        min_purchase: Number(voucher.min_purchase),
      },
      discount,
    });
  } catch (err: any) {
    console.error("Voucher validation error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memvalidasi voucher." },
      { status: 500 }
    );
  }
}
