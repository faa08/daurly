import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  try {
    // 1. Ambil mutasi saldo affiliate
    const { data: saldoRows, error: saldoErr } = await admin
      .from("saldo_affiliate")
      .select("jumlah, tipe, status")
      .eq("id_user", userId);

    if (saldoErr) throw saldoErr;

    let saldoAktif = 0;
    let saldoPending = 0;

    if (saldoRows) {
      for (const row of saldoRows) {
        const amt = Number(row.jumlah);
        if (row.tipe === "masuk") {
          if (row.status === "sukses") {
            saldoAktif += amt;
          } else if (row.status === "pending") {
            saldoPending += amt;
          }
        } else if (row.tipe === "keluar") {
          // Keluar pending atau sukses memotong saldo aktif (reserved)
          if (row.status === "sukses" || row.status === "pending") {
            saldoAktif -= amt;
          }
        }
      }
    }

    // 2. Ambil total klik link
    const { count: totalKlik, error: clickErr } = await admin
      .from("affiliate_clicks")
      .select("*", { count: "exact", head: true })
      .eq("id_user", userId);

    if (clickErr) throw clickErr;

    // 3. Ambil daftar konversi order yang dirujuk
    // Kita gabung order_item ke order (untuk lihat status order, nama pembeli)
    const { data: orderItems, error: itemsErr } = await admin
      .from("order_item")
      .select(`
        id_order_item,
        qty_orderitem,
        hrg_saat_beli,
        nama_produk_snapshot,
        komisi_jumlah,
        order (
          id_order,
          created_at,
          stat_order,
          users (
            nama_lengkap,
            username
          )
        )
      `)
      .eq("id_affiliate", userId);

    if (itemsErr) throw itemsErr;

    // Format data konversi
    const conversions = (orderItems || []).map((item: any) => {
      const ord = item.order;
      return {
        id_order_item: item.id_order_item,
        nama_produk: item.nama_produk_snapshot,
        qty: item.qty_orderitem,
        harga: Number(item.hrg_saat_beli),
        komisi: Number(item.komisi_jumlah),
        orderId: ord?.id_order,
        tanggal: ord?.created_at,
        statusOrder: ord?.stat_order,
        pembeli: ord?.users?.nama_lengkap || ord?.users?.username || "Pembeli",
      };
    }).sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());

    return NextResponse.json({
      saldoAktif,
      saldoPending,
      totalKlik: totalKlik || 0,
      conversions,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Fetch affiliate stats failed:", e.message || err);
    return NextResponse.json(
      { error: e.message || "Gagal memuat statistik affiliate." },
      { status: 500 }
    );
  }
}
