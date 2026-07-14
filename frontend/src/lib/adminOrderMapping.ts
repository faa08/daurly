import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOrder, AdminShipmentOrder } from "@/backend/adminService";
import { getOrderPaymentDisplay } from "@/lib/checkoutConstants";
import { resolveOrderShippingAddress, type AddressParts } from "@/lib/formatShippingAddress";
import { resolveMapCoords } from "@/lib/mapsUtils";
import { resolveProductImageSrc } from "@/lib/productUi";

/** Query lengkap — butuh migrasi ship_lat, cover_img, order_chat, dll. */
export const ADMIN_ORDERS_SELECT = `
  id_order, stat_order, total_hrg, created_at, tipe_pembayaran, catatan, ship_lat, ship_lng,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos, lat, lng ),
  order_item (
    qty_orderitem, hrg_saat_beli, id_produk, nama_produk_snapshot, img_snapshot,
    produk ( id_produk, nama_produk, img, cover_img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir ),
  order_chat ( id_chat )
`;

/** Tanpa embed produk — pakai snapshot + hydrate batch. */
export const ADMIN_ORDERS_SELECT_SNAPSHOT = `
  id_order, stat_order, total_hrg, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, hrg_saat_beli, id_produk, nama_produk_snapshot, img_snapshot
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir )
`;

/** Fallback jika kolom/tabel migrasi belum ada di Supabase. */
export const ADMIN_ORDERS_SELECT_LEGACY = `
  id_order, stat_order, total_hrg, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, hrg_saat_beli, id_produk, nama_produk_snapshot, img_snapshot,
    produk ( id_produk, nama_produk, img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir )
`;

/** Jika kolom snapshot belum dimigrasi. */
export const ADMIN_ORDERS_SELECT_LEGACY_NO_SNAPSHOT = `
  id_order, stat_order, total_hrg, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, hrg_saat_beli, id_produk,
    produk ( id_produk, nama_produk, img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir )
`;

export const ADMIN_SHIPMENTS_SELECT = `
  id_order, stat_order, created_at, tipe_pembayaran, catatan, ship_lat, ship_lng,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos, lat, lng ),
  order_item (
    qty_orderitem, id_produk, nama_produk_snapshot, img_snapshot,
    produk ( id_produk, nama_produk, img, cover_img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir, no_resi, estimasi_tiba, stat_kirim )
`;

export const ADMIN_SHIPMENTS_SELECT_SNAPSHOT = `
  id_order, stat_order, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, id_produk, nama_produk_snapshot, img_snapshot
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir, no_resi, estimasi_tiba, stat_kirim )
`;

export const ADMIN_SHIPMENTS_SELECT_LEGACY = `
  id_order, stat_order, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, id_produk, nama_produk_snapshot, img_snapshot,
    produk ( id_produk, nama_produk, img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir, no_resi, estimasi_tiba, stat_kirim )
`;

export const ADMIN_SHIPMENTS_SELECT_LEGACY_NO_SNAPSHOT = `
  id_order, stat_order, created_at, tipe_pembayaran, catatan,
  users ( nama_lengkap ),
  seller ( nm_store ),
  alamat ( nama_penerima, no_telp, label, detail_alamat, kecamatan, kota, provinsi, kode_pos ),
  order_item (
    qty_orderitem, id_produk,
    produk ( id_produk, nama_produk, img )
  ),
  payment ( stat_pay, metod_pay ),
  pengiriman ( kurir, no_resi, estimasi_tiba, stat_kirim )
`;

export function formatDbError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint, e.code].filter(Boolean);
    if (parts.length) return parts.join(" — ");
    try {
      return JSON.stringify(err);
    } catch {
      return "Kesalahan database tidak diketahui.";
    }
  }
  return String(err);
}

async function runOrderSelect(
  client: SupabaseClient,
  selects: string[],
  shipments: boolean
): Promise<Record<string, unknown>[]> {
  let lastError: unknown;
  for (const select of selects) {
    let query = client.from("order").select(select).order("created_at", { ascending: false }).limit(100);
    if (shipments) query = query.not("stat_order", "eq", "dibatalkan");
    const { data, error } = await query;
    if (!error) return (data || []) as unknown as Record<string, unknown>[];
    lastError = error;
  }
  throw new Error(formatDbError(lastError));
}

async function hydrateOrderRowsProducts(
  rows: Record<string, unknown>[],
  client: SupabaseClient
): Promise<Record<string, unknown>[]> {
  const productIds = new Set<string>();
  for (const o of rows) {
    const items = (o.order_item as OrderItemRow[]) || [];
    for (const item of items) {
      if (!resolveItemProduk(item)?.nama_produk && item.id_produk) {
        productIds.add(item.id_produk);
      }
    }
  }
  if (productIds.size === 0) return rows;

  const idList = [...productIds];
  const productSelects = [
    "id_produk, nama_produk, img, cover_img",
    "id_produk, nama_produk, img",
  ];
  let byId = new Map<string, ProdukRow>();
  for (const sel of productSelects) {
    const { data, error } = await client.from("produk").select(sel).in("id_produk", idList);
    if (!error && data?.length) {
      byId = new Map((data as ProdukRow[]).map((p) => [p.id_produk as string, p]));
      break;
    }
  }
  if (byId.size === 0) return rows;

  return rows.map((o) => ({
    ...o,
    order_item: ((o.order_item as OrderItemRow[]) || []).map((item) => {
      if (resolveItemProduk(item)?.nama_produk) return item;
      const hydrated = item.id_produk ? byId.get(item.id_produk) : null;
      return hydrated ? { ...item, produk: hydrated } : item;
    }),
  }));
}

export async function fetchAdminOrderRows(client: SupabaseClient): Promise<Record<string, unknown>[]> {
  const rows = await runOrderSelect(
    client,
    [
      ADMIN_ORDERS_SELECT,
      ADMIN_ORDERS_SELECT_SNAPSHOT,
      ADMIN_ORDERS_SELECT_LEGACY,
      ADMIN_ORDERS_SELECT_LEGACY_NO_SNAPSHOT,
    ],
    false
  );
  return hydrateOrderRowsProducts(rows, client);
}

export async function fetchAdminShipmentRows(client: SupabaseClient): Promise<Record<string, unknown>[]> {
  const rows = await runOrderSelect(
    client,
    [
      ADMIN_SHIPMENTS_SELECT,
      ADMIN_SHIPMENTS_SELECT_SNAPSHOT,
      ADMIN_SHIPMENTS_SELECT_LEGACY,
      ADMIN_SHIPMENTS_SELECT_LEGACY_NO_SNAPSHOT,
    ],
    true
  );
  return hydrateOrderRowsProducts(rows, client);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function formatOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
}

function formatDateId(iso: string, withTime = false) {
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" };
  return new Date(iso).toLocaleString("id-ID", opts);
}

function mapOrderStatus(statOrder: string, statPay?: string): string {
  if (statOrder === "pending" && statPay !== "success") return "Belum Bayar";
  if (statOrder === "pending" && statPay === "success") return "Perlu Dikirim";
  if (statOrder === "diproses") return "Perlu Dikirim";
  if (statOrder === "dikirim") return "Dikirim";
  if (statOrder === "selesai") return "Selesai";
  if (statOrder === "dibatalkan") return "Dibatalkan";
  return statOrder;
}

function mapShipStatus(statOrder: string, statKirim?: string): AdminShipmentOrder["status"] {
  if (statOrder === "dikirim" || statKirim === "sedang_dikirim") return "Sedang Dikirim";
  if (statOrder === "selesai" || statKirim === "sampai") return "Selesai";
  return "Perlu Dikirim";
}

type OrderItemRow = {
  qty_orderitem?: number;
  hrg_saat_beli?: number;
  id_produk?: string;
  nama_produk_snapshot?: string | null;
  img_snapshot?: string | null;
  produk?: unknown;
};

type ProdukRow = {
  id_produk?: string;
  nama_produk?: string;
  img?: string | null;
  cover_img?: string | null;
};

function pickProduk(items: { produk?: unknown }[]): ProdukRow | null {
  const firstItem = items[0];
  if (!firstItem) return null;
  const raw = firstItem.produk;
  if (!raw) return null;
  return (Array.isArray(raw) ? raw[0] : raw) as ProdukRow;
}

function resolveItemProduk(item: OrderItemRow): ProdukRow | null {
  if (item.nama_produk_snapshot?.trim()) {
    return {
      nama_produk: item.nama_produk_snapshot.trim(),
      img: item.img_snapshot,
      cover_img: item.img_snapshot,
    };
  }
  const fromJoin = pickProduk([item]);
  if (fromJoin?.nama_produk?.trim()) return fromJoin;
  return null;
}

function pickFirstItemProduk(items: OrderItemRow[]): ProdukRow | null {
  for (const item of items) {
    const p = resolveItemProduk(item);
    if (p?.nama_produk) return p;
    const fromJoin = pickProduk([item]);
    if (fromJoin?.nama_produk) return fromJoin;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAdminOrderRow(o: any): AdminOrder {
  const user = Array.isArray(o.users) ? o.users[0] : o.users;
  const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
  const items = (o.order_item || []) as OrderItemRow[];
  const produk = pickFirstItemProduk(items);
  const pengiriman = Array.isArray(o.pengiriman) ? o.pengiriman[0] : o.pengiriman;
  const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
  const orderChat = Array.isArray(o.order_chat) ? o.order_chat[0] : o.order_chat;
  const alamatRow = Array.isArray(o.alamat) ? o.alamat[0] : o.alamat;
  const paymentInfo = getOrderPaymentDisplay({
    tipe_pembayaran: o.tipe_pembayaran,
    metod_pay: payment?.metod_pay,
    kurir: pengiriman?.kurir,
    catatan: o.catatan,
  });
  const shippingAddress = resolveOrderShippingAddress({
    alamat: alamatRow as AddressParts | null,
    catatan: o.catatan,
    isPickup: paymentInfo.kind === "pickup",
  });
  const mapCoords = resolveMapCoords({
    shipLat: o.ship_lat,
    shipLng: o.ship_lng,
    alamatLat: (alamatRow as AddressParts | null)?.lat,
    alamatLng: (alamatRow as AddressParts | null)?.lng,
    isPickup: paymentInfo.kind === "pickup",
  });
  const status = mapOrderStatus(o.stat_order, payment?.stat_pay);
  const needsShippingChat =
    paymentInfo.kind === "digital" &&
    payment?.stat_pay === "success" &&
    (status === "Perlu Dikirim" || status === "Dikirim");
  const buyerName = user?.nama_lengkap || "Pembeli";
  const totalQty = items.reduce((s: number, i: { qty_orderitem?: number }) => s + (i.qty_orderitem || 1), 0);

  return {
    id: formatOrderId(o.id_order),
    uuid: o.id_order,
    date: formatDateId(o.created_at, true),
    buyer: buyerName,
    avatar: initials(buyerName),
    storeName: seller?.nm_store || "Toko Daur Ulang",
    productName: produk?.nama_produk || "Produk",
    productDetail:
      items.length > 1 ? `${items.length} item (${totalQty} pcs)` : `${items[0]?.qty_orderitem || 1} pcs`,
    productImg: resolveProductImageSrc(produk),
    total: Number(o.total_hrg),
    status,
    paymentLabel: paymentInfo.label,
    paymentDesc: paymentInfo.desc,
    paymentKind: paymentInfo.kind,
    chatId: orderChat?.id_chat || null,
    needsShippingChat,
    shippingAddress,
    recipientName: (alamatRow as AddressParts | null)?.nama_penerima || "",
    recipientPhone: (alamatRow as AddressParts | null)?.no_telp || "",
    shipLat: mapCoords?.lat ?? null,
    shipLng: mapCoords?.lng ?? null,
    buktiBayar: payment?.bukti_bayar || null,
    statPay: payment?.stat_pay || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAdminShipmentRow(o: any): AdminShipmentOrder | null {
  const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
  if (o.stat_order === "pending" && payment?.stat_pay !== "success") return null;
  if (!["diproses", "dikirim", "selesai", "pending"].includes(o.stat_order)) return null;

  const user = Array.isArray(o.users) ? o.users[0] : o.users;
  const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
  const alamat = Array.isArray(o.alamat) ? o.alamat[0] : o.alamat;
  const items = (o.order_item || []) as OrderItemRow[];
  const pengiriman = Array.isArray(o.pengiriman) ? o.pengiriman[0] : o.pengiriman;
  const produk = pickFirstItemProduk(items);
  const paymentInfo = getOrderPaymentDisplay({
    tipe_pembayaran: o.tipe_pembayaran,
    metod_pay: payment?.metod_pay,
    kurir: pengiriman?.kurir,
    catatan: o.catatan,
  });
  const totalQty = items.reduce((s: number, i: { qty_orderitem?: number }) => s + (i.qty_orderitem || 1), 0);
  const addressText = resolveOrderShippingAddress({
    alamat: alamat as AddressParts | null,
    catatan: o.catatan,
    isPickup: paymentInfo.kind === "pickup",
  });
  const mapCoords = resolveMapCoords({
    shipLat: o.ship_lat,
    shipLng: o.ship_lng,
    alamatLat: (alamat as AddressParts | null)?.lat,
    alamatLng: (alamat as AddressParts | null)?.lng,
    isPickup: paymentInfo.kind === "pickup",
  });

  return {
    id: formatOrderId(o.id_order),
    uuid: o.id_order,
    buyer: user?.nama_lengkap || "Pembeli",
    storeName: seller?.nm_store || "Toko Daur Ulang",
    product: produk?.nama_produk || "Produk",
    productImg: resolveProductImageSrc(produk),
    qty: totalQty,
    address: addressText,
    date: formatDateId(o.created_at),
    status: mapShipStatus(o.stat_order, pengiriman?.stat_kirim),
    shipLat: mapCoords?.lat ?? null,
    shipLng: mapCoords?.lng ?? null,
    courier: pengiriman?.kurir,
    resi: pengiriman?.no_resi,
    eta: pengiriman?.estimasi_tiba ? formatDateId(pengiriman.estimasi_tiba) : undefined,
    paymentLabel: paymentInfo.label,
    paymentDesc: paymentInfo.desc,
    paymentKind: paymentInfo.kind,
  };
}
