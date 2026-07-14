import type { SupabaseClient } from "@supabase/supabase-js";

export async function settleOrderBalances(
  admin: SupabaseClient,
  orderId: string
): Promise<void> {
  try {
    // 1. Ambil data order
    const { data: order, error: orderErr } = await admin
      .from("order")
      .select("id_order, id_seller, total_hrg")
      .eq("id_order", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      console.error("Gagal mendapatkan data order untuk penyelesaian saldo:", orderErr);
      return;
    }

    // 2. Ambil item order untuk hitung subtotal & komisi affiliate
    const { data: items, error: itemsErr } = await admin
      .from("order_item")
      .select("id_order_item, qty_orderitem, hrg_saat_beli, komisi_jumlah")
      .eq("id_order", orderId);

    if (itemsErr || !items || items.length === 0) {
      console.error("Gagal mendapatkan item order untuk penyelesaian saldo:", itemsErr);
      return;
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.hrg_saat_beli) * item.qty_orderitem,
      0
    );
    const totalKomisi = items.reduce(
      (sum, item) => sum + (Number(item.komisi_jumlah) || 0),
      0
    );

    // 3. Cairkan komisi affiliate jika ada (ubah pending -> sukses)
    const itemIds = items.map((item) => item.id_order_item);
    const { error: affErr } = await admin
      .from("saldo_affiliate")
      .update({ status: "sukses" })
      .in("id_order_item", itemIds);

    if (affErr) {
      console.error("Gagal memperbarui status saldo affiliate:", affErr);
    }

    // 4. Masukkan pendapatan bersih ke saldo_seller (status sukses)
    const netEarnings = subtotal - totalKomisi;
    if (netEarnings > 0) {
      const { error: sellerErr } = await admin.from("saldo_seller").insert({
        id_seller: order.id_seller,
        id_order: order.id_order,
        jumlah: netEarnings,
        tipe: "masuk",
        stat_saldo: "sukses",
        ket: `Pendapatan bersih order #${order.id_order.slice(0, 8)} (Subtotal: Rp${subtotal.toLocaleString("id-ID")}${
          totalKomisi > 0 ? `, Potong Komisi Affiliate: Rp${totalKomisi.toLocaleString("id-ID")}` : ""
        })`,
      });

      if (sellerErr) {
        console.error("Gagal memasukkan saldo seller:", sellerErr);
      }
    }
  } catch (err) {
    console.error("Error in settleOrderBalances:", err);
  }
}
