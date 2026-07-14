import { createSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_SHIPPING_GREETING =
  "Halo! Pembayaran QRIS/digital Anda sudah berhasil ✅ Admin Daurly akan mengatur pengiriman lewat chat ini. Mohon konfirmasi alamat lengkap, nomor HP aktif, dan jadwal penerimaan yang paling nyaman untuk Anda.";

/** Buat room chat pengiriman + notifikasi ke pembeli & semua admin */
export async function setupShippingChatAfterDigitalPay(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>["client"]>,
  id_order: string
): Promise<string | null> {
  const { data: order } = await admin
    .from("order")
    .select("id_user, total_hrg, tipe_pembayaran")
    .eq("id_order", id_order)
    .maybeSingle();

  if (!order?.id_user) return null;
  if (order.tipe_pembayaran === "offline") return null;

  const { data: existingChat } = await admin
    .from("order_chat")
    .select("id_chat")
    .eq("id_order", id_order)
    .maybeSingle();

  let chatId = existingChat?.id_chat;
  if (!chatId) {
    const { data: newChat, error: chatErr } = await admin
      .from("order_chat")
      .insert({ id_order, id_user: order.id_user })
      .select("id_chat")
      .single();
    if (chatErr) throw chatErr;
    chatId = newChat.id_chat;

    const { data: items } = await admin
      .from("order_item")
      .select("nama_produk_snapshot, qty_orderitem, hrg_saat_beli")
      .eq("id_order", id_order);

    let itemsText = "";
    if (items && items.length > 0) {
      itemsText = "\n\n📦 *Barang yang dibeli:*\n" + items.map(item => 
        `- ${item.nama_produk_snapshot} (x${item.qty_orderitem}) - Rp ${Number(item.hrg_saat_beli).toLocaleString("id-ID")}`
      ).join("\n");
    }

    const greetingText = `Halo! Pembayaran QRIS/digital Anda sudah berhasil ✅ Admin Daurly akan mengatur pengiriman lewat chat ini.${itemsText}\n\nMohon konfirmasi alamat lengkap, nomor HP aktif, dan jadwal penerimaan yang paling nyaman untuk Anda.`;

    await admin.from("order_chat_message").insert({
      id_chat: chatId,
      sender_role: "admin",
      sender_id: null,
      text: greetingText,
    });
  }

  const total = Number(order.total_hrg).toLocaleString("id-ID");
  const chatLink = `/account/orders/${id_order}/chat`;
  const adminChatLink = `/admin/chat?tab=shipping&order=${id_order}`;

  await admin.from("notifikasi").insert({
    id_user: order.id_user,
    judul: "Pembayaran QRIS Berhasil",
    pesan: `Pesanan Rp ${total} dikonfirmasi. Admin akan menghubungi Anda via chat untuk koordinasi pengiriman.`,
    tipe: "payment",
    link: chatLink,
    id_order,
    is_read: false,
  });

  const { data: admins } = await admin.from("users").select("id_user").eq("role", "admin");
  if (admins?.length) {
    await admin.from("notifikasi").insert(
      admins.map((a) => ({
        id_user: a.id_user,
        judul: "Pesanan QRIS — Chat Pengiriman",
        pesan: `Pembeli sudah bayar QRIS (Rp ${total}). Segera chat pembeli untuk koordinasi alamat & pengiriman.`,
        tipe: "order",
        link: adminChatLink,
        id_order,
        is_read: false,
      }))
    );
  }

  return chatId;
}
