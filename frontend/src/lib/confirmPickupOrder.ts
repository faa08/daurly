import type { SupabaseClient } from "@supabase/supabase-js";

export async function confirmPickupOrder(
  admin: SupabaseClient,
  orderId: string
): Promise<{ ok: true; already?: boolean }> {
  const { data: order, error: orderErr } = await admin
    .from("order")
    .select(`
      id_order, id_user, stat_order, tipe_pembayaran,
      pengiriman ( kurir ),
      payment ( stat_pay )
    `)
    .eq("id_order", orderId)
    .maybeSingle();

  if (orderErr) throw orderErr;
  if (!order) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  if (order.stat_order === "selesai") {
    return { ok: true, already: true };
  }

  const pengiriman = Array.isArray(order.pengiriman) ? order.pengiriman[0] : order.pengiriman;
  const isPickup =
    order.tipe_pembayaran === "offline" || pengiriman?.kurir === "Ambil di Toko";

  if (!isPickup) {
    throw new Error("Bukan pesanan pickup.");
  }

  if (order.stat_order !== "diproses" && order.stat_order !== "dikirim") {
    throw new Error("Pesanan pickup belum siap dikonfirmasi.");
  }

  const now = new Date().toISOString();

  const { error: updateOrderErr } = await admin
    .from("order")
    .update({ stat_order: "selesai", updated_at: now })
    .eq("id_order", orderId);
  if (updateOrderErr) throw updateOrderErr;

  const { error: payErr } = await admin
    .from("payment")
    .update({ stat_pay: "success", tgl_pay: now })
    .eq("id_order", orderId);
  if (payErr) throw payErr;

  const { error: shipErr } = await admin
    .from("pengiriman")
    .update({ stat_kirim: "sampai" })
    .eq("id_order", orderId);
  if (shipErr) throw shipErr;

  const { settleOrderBalances } = await import("@/lib/settleOrderBalances");
  await settleOrderBalances(admin, orderId);

  if (order.id_user) {
    await admin.from("notifikasi").insert({
      id_user: order.id_user,
      judul: "Pickup Selesai",
      pesan:
        "Admin telah mengonfirmasi pesanan Anda sudah diambil & dibayar. Terima kasih! Berikan ulasan untuk produk yang dibeli.",
      tipe: "order",
      link: "/account/orders",
      id_order: orderId,
      is_read: false,
    });
  }

  return { ok: true };
}
