import { NextRequest, NextResponse } from "next/server";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";
import { formatShippingAddressText } from "@/lib/formatShippingAddress";
import { extractProductCoverUrl } from "@/lib/productUi";

type CartRow = {
  id_cart_item: string;
  id_produk: string;
  qty_cartitem: number;
  pilihan_varian?: { picks?: number[] } | null;
  produk: {
    id_produk: string;
    id_seller: string;
    nama_produk: string;
    harga: number;
    produk_stock: number;
    berat: number;
    varian?: unknown;
    img?: string | null;
    cover_img?: string | null;
    komisi_persen?: number | null;
    seller: { nm_store: string } | { nm_store: string }[];
  } | null;
};

function normalizeSeller(produk: CartRow["produk"]) {
  if (!produk?.seller) return "Toko Daur Ulang";
  return Array.isArray(produk.seller) ? produk.seller[0]?.nm_store : produk.seller.nm_store;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { ctx } = auth;
  const { admin } = ctx;

  try {
    const body = await request.json();
    const bodyUserId = String(body.userId || "");
    const denied = denyForeignUser(ctx, bodyUserId);
    if (denied) return denied;

    const userId = ctx.user.id_user;
    const cartItemIds: string[] = body.cartItemIds || [];
    const addressId = body.addressId ? String(body.addressId) : null;
    const paymentType = body.paymentType === "offline" ? "offline" : "digital";
    const courier =
      paymentType === "offline" ? "Ambil di Toko" : String(body.courier || "JNE");
    const shippingCost = paymentType === "offline" ? 0 : Number(body.shippingCost) || 0;
    const diskon = Number(body.diskon) || 0;
    const biayaLayanan = Number(body.biayaLayanan) || 0;

    if (!cartItemIds.length) {
      return NextResponse.json({ error: "Item keranjang wajib diisi." }, { status: 400 });
    }
    if (paymentType === "digital" && !addressId) {
      return NextResponse.json(
        { error: "Alamat pengiriman wajib untuk pembayaran digital." },
        { status: 400 }
      );
    }

    const affiliateCookie = request.cookies.get("daurly_affiliate_code")?.value || null;
    let affiliateId: string | null = null;
    if (affiliateCookie) {
      const { data: affUser } = await admin
        .from("users")
        .select("id_user")
        .eq("affiliate_code", affiliateCookie)
        .eq("is_affiliate", true)
        .maybeSingle();
      if (affUser && affUser.id_user !== userId) {
        affiliateId = affUser.id_user;
      }
    }

    const { data: cart, error: cartErr } = await admin
      .from("cart")
      .select("id_cart")
      .eq("id_user", userId)
      .maybeSingle();

    if (cartErr) throw cartErr;
    if (!cart) {
      return NextResponse.json({ error: "Keranjang tidak ditemukan." }, { status: 404 });
    }

    const { data: cartItems, error: itemsErr } = await admin
      .from("cart_item")
      .select(
        `id_cart_item, id_produk, qty_cartitem, pilihan_varian,
        produk ( id_produk, id_seller, nama_produk, harga, produk_stock, berat, varian, img, cover_img, komisi_persen, seller ( nm_store ) )`
      )
      .eq("id_cart", cart.id_cart)
      .in("id_cart_item", cartItemIds);

    if (itemsErr) throw itemsErr;
    if (!cartItems?.length) {
      return NextResponse.json({ error: "Item keranjang tidak ditemukan." }, { status: 404 });
    }

    const validItems = (cartItems as unknown as CartRow[]).filter((i) => i.produk);
    if (!validItems.length) {
      return NextResponse.json({ error: "Produk tidak valid." }, { status: 400 });
    }

    const { getStockForPicks, parseVariantRaw } = await import("@/lib/variantInventory");
    for (const item of validItems) {
      const picks = item.pilihan_varian?.picks;
      const { inventory } = parseVariantRaw(item.produk!.varian);
      const stock =
        picks?.length && inventory.length
          ? getStockForPicks(inventory, picks, Number(item.produk!.produk_stock))
          : Number(item.produk!.produk_stock);
      if (stock < item.qty_cartitem) {
        return NextResponse.json(
          { error: `Stok "${item.produk!.nama_produk}" tidak mencukupi (tersisa ${stock}).` },
          { status: 400 }
        );
      }
    }

    const groups = new Map<string, CartRow[]>();
    for (const item of validItems) {
      const sellerId = item.produk!.id_seller;
      if (!groups.has(sellerId)) groups.set(sellerId, []);
      groups.get(sellerId)!.push(item);
    }

    const grandSubtotal = validItems.reduce(
      (s, i) => s + Number(i.produk!.harga) * i.qty_cartitem,
      0
    );

    const metodPay = paymentType === "offline" ? "cod" : "qris";
    const createdOrders: {
      id_order: string;
      id_seller: string;
      nm_store: string;
      total_hrg: number;
    }[] = [];

    let digitalShippingNote: string | null = null;
    let shipLat: number | null = null;
    let shipLng: number | null = null;
    if (paymentType === "digital" && addressId) {
      const { data: addrRow } = await admin
        .from("alamat")
        .select(
          "nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos, lat, lng"
        )
        .eq("id_alamat", addressId)
        .maybeSingle();
      if (addrRow) {
        digitalShippingNote = formatShippingAddressText(addrRow);
        if (addrRow.lat != null && addrRow.lng != null) {
          shipLat = Number(addrRow.lat);
          shipLng = Number(addrRow.lng);
        }
      }
    }

    const transactionRef = `TRX-${Date.now().toString(36).toUpperCase()}`;
    let groupIndex = 0;
    const groupCount = groups.size;

    for (const [sellerId, items] of groups) {
      const subtotal = items.reduce(
        (s, i) => s + Number(i.produk!.harga) * i.qty_cartitem,
        0
      );
      const share = grandSubtotal > 0 ? subtotal / grandSubtotal : 1 / groupCount;
      const orderOngkir = Math.round(shippingCost * share);
      const orderDiskon = Math.round(diskon * share);
      const orderBiaya = groupIndex === 0 ? biayaLayanan : 0;
      const totalHrg = subtotal + orderOngkir + orderBiaya - orderDiskon;

      const id_order = crypto.randomUUID();

      const { error: orderErr } = await admin.from("order").insert({
        id_order,
        id_user: userId,
        id_seller: sellerId,
        id_alamat: addressId,
        total_hrg: totalHrg,
        ongkir: orderOngkir,
        diskon: orderDiskon,
        biaya_layanan: orderBiaya,
        stat_order: "pending",
        tipe_pembayaran: paymentType,
        transaction_ref: transactionRef,
        catatan:
          paymentType === "offline"
            ? "Ambil di toko — bayar saat pickup"
            : digitalShippingNote,
        ship_lat: paymentType === "digital" ? shipLat : null,
        ship_lng: paymentType === "digital" ? shipLng : null,
      });
      if (orderErr) throw orderErr;

      const orderItems = items.map((i) => {
        const p = i.produk!;
        const imgSnap = extractProductCoverUrl({ cover_img: p.cover_img, img: p.img });
        const komisiPersen = affiliateId ? (Number(p.komisi_persen) || 5.00) : 0;
        const komisiJumlah = affiliateId ? Math.round((Number(p.harga) * komisiPersen) / 100) * i.qty_cartitem : 0;
        return {
          id_order_item: crypto.randomUUID(),
          id_order,
          id_produk: i.id_produk,
          qty_orderitem: i.qty_cartitem,
          hrg_saat_beli: Number(p.harga),
          pilihan_varian: i.pilihan_varian ?? null,
          nama_produk_snapshot: p.nama_produk,
          img_snapshot: imgSnap,
          id_affiliate: affiliateId,
          komisi_jumlah: komisiJumlah,
        };
      });

      const orderItemPromise = admin.from("order_item").insert(orderItems);

      const paymentPromise = admin.from("payment").insert({
        id_payment: crypto.randomUUID(),
        id_order,
        juml_pay: totalHrg,
        metod_pay: metodPay,
        stat_pay: "pending",
      });

      const pengirimanPromise = admin.from("pengiriman").insert({
        id_pengiriman: crypto.randomUUID(),
        id_order,
        kurir: courier,
        stat_kirim: "belum_dikirim",
      });

      let chatPromise: Promise<void> = Promise.resolve();
      if (paymentType === "digital") {
        chatPromise = (async () => {
          const { data: newChat, error: chatErr } = await admin
            .from("order_chat")
            .insert({ id_order, id_user: userId })
            .select("id_chat")
            .single();

          if (!chatErr && newChat?.id_chat) {
            const { error: msgErr } = await admin.from("order_chat_message").insert({
              id_chat: newChat.id_chat,
              sender_role: "admin",
              sender_id: null,
              text: "Halo! Silakan melakukan pembayaran menggunakan QRIS E-Wallet. Anda dapat meminta QR Code melalui chat ini atau menghubungi WhatsApp admin.",
            });
            if (msgErr) throw msgErr;
          } else if (chatErr) {
            throw chatErr;
          }
        })();
      }

      const saldoAffiliateEntries = orderItems
        .filter((item) => item.komisi_jumlah > 0)
        .map((item) => ({
          id_saldo_aff: crypto.randomUUID(),
          id_user: affiliateId!,
          id_order_item: item.id_order_item,
          jumlah: item.komisi_jumlah,
          tipe: "masuk",
          status: "pending",
          keterangan: `Komisi rujukan produk "${item.nama_produk_snapshot}"`,
        }));

      const saldoAffPromise = saldoAffiliateEntries.length > 0
        ? admin.from("saldo_affiliate").insert(saldoAffiliateEntries)
        : Promise.resolve({ error: null });

      const results = await Promise.all([
        orderItemPromise,
        paymentPromise,
        pengirimanPromise,
        chatPromise,
        saldoAffPromise,
      ]);

      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      if (results[2].error) throw results[2].error;
      if (results[4] && (results[4] as any).error) throw (results[4] as any).error;

      createdOrders.push({
        id_order,
        id_seller: sellerId,
        nm_store: normalizeSeller(items[0].produk),
        total_hrg: totalHrg,
      });
      groupIndex++;
    }

    const deletePromise = admin
      .from("cart_item")
      .delete()
      .in("id_cart_item", cartItemIds);

    const notifMsg =
      paymentType === "offline"
        ? `${createdOrders.length} pesanan pickup dibuat. Datang ke toko untuk bayar & ambil.`
        : `${createdOrders.length} pesanan menunggu pembayaran digital.`;

    const notifPromise = admin.from("notifikasi").insert({
      id_user: userId,
      judul: paymentType === "offline" ? "Pesanan Pickup" : "Pesanan Dibuat",
      pesan: notifMsg,
      tipe: "order",
      link: "/account/orders",
      is_read: false,
    });

    const [delRes, notifRes] = await Promise.all([deletePromise, notifPromise]);
    if (delRes.error) throw delRes.error;
    if (notifRes.error) throw notifRes.error;

    return NextResponse.json({
      orders: createdOrders,
      transactionRef,
      paymentType,
      totalAmount: createdOrders.reduce((s, o) => s + o.total_hrg, 0),
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("API checkout failed:", e.message || err);
    return NextResponse.json({ error: e.message || "Gagal membuat pesanan." }, { status: 500 });
  }
}
