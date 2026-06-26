import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type CartRow = {
  id_cart_item: string;
  id_produk: string;
  qty_cartitem: number;
  produk: {
    id_produk: string;
    id_seller: string;
    nama_produk: string;
    harga: number;
    produk_stock: number;
    berat: number;
    seller: { nm_store: string } | { nm_store: string }[];
  } | null;
};

function normalizeSeller(produk: CartRow["produk"]) {
  if (!produk?.seller) return "Toko UMKM";
  return Array.isArray(produk.seller) ? produk.seller[0]?.nm_store : produk.seller.nm_store;
}

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "Database admin tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const userId = String(body.userId || "");
    const cartItemIds: string[] = body.cartItemIds || [];
    const addressId = body.addressId ? String(body.addressId) : null;
    const paymentType = body.paymentType === "offline" ? "offline" : "digital";
    const courier =
      paymentType === "offline" ? "Ambil di Toko" : String(body.courier || "JNE");
    const shippingCost = paymentType === "offline" ? 0 : Number(body.shippingCost) || 0;
    const diskon = Number(body.diskon) || 0;
    const biayaLayanan = Number(body.biayaLayanan) || 0;

    if (!userId || !cartItemIds.length) {
      return NextResponse.json({ error: "User dan item keranjang wajib diisi." }, { status: 400 });
    }
    if (paymentType === "digital" && !addressId) {
      return NextResponse.json(
        { error: "Alamat pengiriman wajib untuk pembayaran digital." },
        { status: 400 }
      );
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
        `id_cart_item, id_produk, qty_cartitem,
        produk ( id_produk, id_seller, nama_produk, harga, produk_stock, berat, seller ( nm_store ) )`
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

    for (const item of validItems) {
      const stock = Number(item.produk!.produk_stock);
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
        catatan: paymentType === "offline" ? "Ambil di toko — bayar saat pickup" : null,
      });
      if (orderErr) throw orderErr;

      const orderItems = items.map((i) => ({
        id_order_item: crypto.randomUUID(),
        id_order,
        id_produk: i.id_produk,
        qty_orderitem: i.qty_cartitem,
        hrg_saat_beli: Number(i.produk!.harga),
      }));

      const { error: oiErr } = await admin.from("order_item").insert(orderItems);
      if (oiErr) throw oiErr;

      const { error: payErr } = await admin.from("payment").insert({
        id_payment: crypto.randomUUID(),
        id_order,
        juml_pay: totalHrg,
        metod_pay: metodPay,
        stat_pay: "pending",
      });
      if (payErr) throw payErr;

      const { error: shipErr } = await admin.from("pengiriman").insert({
        id_pengiriman: crypto.randomUUID(),
        id_order,
        kurir: courier,
        stat_kirim: paymentType === "offline" ? "belum_dikirim" : "belum_dikirim",
      });
      if (shipErr) throw shipErr;

      for (const item of items) {
        const newStock = Number(item.produk!.produk_stock) - item.qty_cartitem;
        const { error: stockErr } = await admin
          .from("produk")
          .update({
            produk_stock: newStock,
            stat_produk: newStock > 0 ? "tersedia" : "tidak tersedia",
          })
          .eq("id_produk", item.id_produk);
        if (stockErr) throw stockErr;
      }

      createdOrders.push({
        id_order,
        id_seller: sellerId,
        nm_store: normalizeSeller(items[0].produk),
        total_hrg: totalHrg,
      });
      groupIndex++;
    }

    const { error: delErr } = await admin
      .from("cart_item")
      .delete()
      .in("id_cart_item", cartItemIds);
    if (delErr) throw delErr;

    const notifMsg =
      paymentType === "offline"
        ? `${createdOrders.length} pesanan pickup dibuat. Datang ke toko untuk bayar & ambil.`
        : `${createdOrders.length} pesanan menunggu pembayaran digital.`;

    const { error: notifErr } = await admin.from("notifikasi").insert({
      id_user: userId,
      judul: paymentType === "offline" ? "Pesanan Pickup" : "Pesanan Dibuat",
      pesan: notifMsg,
      tipe: "order",
      link: "/account/orders",
      is_read: false,
    });
    if (notifErr) console.warn("notifikasi insert skipped:", notifErr.message);

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
