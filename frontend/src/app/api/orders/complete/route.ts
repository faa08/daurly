import { NextRequest, NextResponse } from "next/server";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;

  try {
    const body = await request.json();
    const denied = denyForeignUser(auth.ctx, body.userId ? String(body.userId) : null);
    if (denied) return denied;

    const userId = auth.ctx.user.id_user;
    const orderId = String(body.orderId || "");
    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib." }, { status: 400 });
    }

    const { data: order, error: orderErr } = await admin
      .from("order")
      .select("id_order, id_user, stat_order, pengiriman ( kurir )")
      .eq("id_order", orderId)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order || order.id_user !== userId) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.stat_order === "selesai") {
      return NextResponse.json({ ok: true, already: true });
    }

    const pengiriman = Array.isArray(order.pengiriman) ? order.pengiriman[0] : order.pengiriman;
    const isPickup = pengiriman?.kurir === "Ambil di Toko";
    const canComplete =
      order.stat_order === "dikirim" ||
      (isPickup && order.stat_order === "diproses");

    if (!canComplete) {
      return NextResponse.json(
        { error: "Pesanan belum bisa diselesaikan. Tunggu hingga barang dikirim atau siap diambil." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateErr } = await admin
      .from("order")
      .update({ stat_order: "selesai", updated_at: now })
      .eq("id_order", orderId);
    if (updateErr) throw updateErr;

    await admin
      .from("pengiriman")
      .update({ stat_kirim: "sampai" })
      .eq("id_order", orderId);

    const { settleOrderBalances } = await import("@/lib/settleOrderBalances");
    await settleOrderBalances(admin, orderId);

    await admin.from("notifikasi").insert({
      id_user: userId,
      judul: "Pesanan Selesai",
      pesan: "Terima kasih! Pesanan Anda telah diselesaikan. Berikan ulasan untuk produk yang dibeli.",
      tipe: "order",
      link: "/account/orders",
      id_order: orderId,
      is_read: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal menyelesaikan pesanan." }, { status: 500 });
  }
}
