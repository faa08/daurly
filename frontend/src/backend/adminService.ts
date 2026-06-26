import { supabase } from "./supabase";
import { getOrderPaymentDisplay, type OrderPaymentKind } from "@/lib/checkoutConstants";

const isPlaceholder = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes("placeholder");
};

export interface AdminSaldoTransaction {
  id: string;
  date: string;
  storeName: string;
  description: string;
  type: "masuk" | "keluar";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
}

export interface AdminSaldoSummary {
  totalAvailable: number;
  totalPending: number;
  pendingCount: number;
}

export interface AdminOrder {
  id: string;
  uuid: string;
  date: string;
  buyer: string;
  avatar: string;
  storeName: string;
  productName: string;
  productDetail: string;
  productImg: string;
  total: number;
  status: string;
  paymentLabel: string;
  paymentDesc: string;
  paymentKind: OrderPaymentKind;
  chatId?: string | null;
  needsShippingChat: boolean;
}

export type AdminShipStatus = "Perlu Dikirim" | "Sedang Dikirim" | "Selesai";

export interface AdminShipmentOrder {
  id: string;
  uuid: string;
  buyer: string;
  storeName: string;
  product: string;
  qty: number;
  address: string;
  date: string;
  status: AdminShipStatus;
  courier?: string;
  resi?: string;
  eta?: string;
  paymentLabel: string;
  paymentDesc: string;
  paymentKind: OrderPaymentKind;
}

function mapSaldoStatus(stat: string): "Berhasil" | "Pending" | "Gagal" {
  if (stat === "sukses") return "Berhasil";
  if (stat === "gagal") return "Gagal";
  return "Pending";
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

function mapShipStatus(statOrder: string, statKirim?: string): AdminShipStatus {
  if (statOrder === "dikirim" || statKirim === "sedang_dikirim") return "Sedang Dikirim";
  if (statOrder === "selesai" || statKirim === "sampai") return "Selesai";
  return "Perlu Dikirim";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
}

function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img) as unknown[];
      const first = arr.map((x) => String(x ?? "").trim()).find(Boolean);
      return first || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

function formatDateId(iso: string, withTime = false) {
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" };
  return new Date(iso).toLocaleString("id-ID", opts);
}

export const adminService = {
  isConfigured(): boolean {
    return !isPlaceholder();
  },

  async getSaldoSummary(): Promise<AdminSaldoSummary> {
    if (isPlaceholder()) {
      return { totalAvailable: 0, totalPending: 0, pendingCount: 0 };
    }

    try {
      const { data, error } = await supabase.from("saldo_seller").select("jumlah, tipe, stat_saldo");

      if (error || !data?.length) {
        return { totalAvailable: 0, totalPending: 0, pendingCount: 0 };
      }

      let totalAvailable = 0;
      let totalPending = 0;
      let pendingCount = 0;

      for (const row of data) {
        const amount = Number(row.jumlah);
        if (row.stat_saldo === "sukses") {
          totalAvailable += row.tipe === "masuk" ? amount : -amount;
        } else if (row.stat_saldo === "pending") {
          totalPending += amount;
          pendingCount += 1;
        }
      }

      return {
        totalAvailable: Math.max(0, totalAvailable),
        totalPending,
        pendingCount,
      };
    } catch (err) {
      console.error("adminService.getSaldoSummary failed:", err);
      return { totalAvailable: 0, totalPending: 0, pendingCount: 0 };
    }
  },

  async getSaldoTransactions(): Promise<AdminSaldoTransaction[]> {
    if (isPlaceholder()) return [];

    try {
      const { data: saldoRows, error: saldoError } = await supabase
        .from("saldo_seller")
        .select(`
          id_saldo, jumlah, tipe, stat_saldo, ket, created_at,
          seller ( nm_store ),
          order ( id_order )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      type RawTx = AdminSaldoTransaction & { createdAt: string };
      const raw: RawTx[] = [];

      if (!saldoError && saldoRows?.length) {
        for (const row of saldoRows) {
          const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
          const order = Array.isArray(row.order) ? row.order[0] : row.order;
          const orderRef = order?.id_order
            ? `INV/${order.id_order.replace(/-/g, "").substring(0, 8).toUpperCase()}`
            : null;

          let description = row.ket || "";
          if (!description && orderRef) {
            description =
              row.tipe === "masuk"
                ? `Pembayaran Order ${orderRef}`
                : `Penarikan Dana Toko`;
          }
          if (!description) {
            description = row.tipe === "masuk" ? "Pemasukan saldo toko" : "Penarikan dana toko";
          }

          raw.push({
            id: row.id_saldo.substring(0, 8).toUpperCase(),
            date: formatDateId(row.created_at),
            storeName: seller?.nm_store || "Toko UMKM",
            description,
            type: row.tipe as "masuk" | "keluar",
            amount: Number(row.jumlah),
            status: mapSaldoStatus(row.stat_saldo),
            createdAt: row.created_at,
          });
        }
      }

      const { data: payments, error: payError } = await supabase
        .from("payment")
        .select(`
          id_payment, juml_pay, stat_pay, metod_pay, created_at,
          order (
            id_order,
            seller ( nm_store )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!payError && payments?.length) {
        for (const pay of payments) {
          const order = Array.isArray(pay.order) ? pay.order[0] : pay.order;
          const seller = order?.seller
            ? Array.isArray(order.seller)
              ? order.seller[0]
              : order.seller
            : null;
          const orderRef = order?.id_order
            ? `INV/${order.id_order.replace(/-/g, "").substring(0, 8).toUpperCase()}`
            : "INV/UNKNOWN";

          const status =
            pay.stat_pay === "success"
              ? "Berhasil"
              : pay.stat_pay === "failed"
                ? "Gagal"
                : "Pending";

          raw.push({
            id: pay.id_payment.substring(0, 8).toUpperCase(),
            date: formatDateId(pay.created_at),
            storeName: seller?.nm_store || "Toko UMKM",
            description: `Pembayaran Order ${orderRef} (${pay.metod_pay})`,
            type: "masuk",
            amount: Number(pay.juml_pay),
            status,
            createdAt: pay.created_at,
          });
        }
      }

      raw.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return raw.map(({ createdAt: _, ...tx }) => tx);
    } catch (err) {
      console.error("adminService.getSaldoTransactions failed:", err);
      return [];
    }
  },

  async requestWithdrawal(
    sellerId: string,
    amount: number,
    bankInfo: string
  ): Promise<boolean> {
    if (isPlaceholder()) return false;

    try {
      const { error } = await supabase.from("saldo_seller").insert({
        id_seller: sellerId,
        jumlah: amount,
        tipe: "keluar",
        stat_saldo: "pending",
        ket: bankInfo,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("adminService.requestWithdrawal failed:", err);
      return false;
    }
  },

  async getFirstSellerId(): Promise<string | null> {
    if (isPlaceholder()) return null;
    try {
      const { data } = await supabase.from("seller").select("id_seller").limit(1).maybeSingle();
      return data?.id_seller || null;
    } catch {
      return null;
    }
  },

  async getOrders(): Promise<AdminOrder[]> {
    if (isPlaceholder()) return [];

    try {
      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, stat_order, total_hrg, created_at, tipe_pembayaran, catatan,
          users ( nama_lengkap ),
          seller ( nm_store ),
          order_item (
            qty_orderitem, hrg_saat_beli,
            produk ( nama_produk, img )
          ),
          payment ( stat_pay, metod_pay ),
          pengiriman ( kurir ),
          order_chat ( id_chat )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data?.length) return [];

      return data.map((o) => {
        const user = Array.isArray(o.users) ? o.users[0] : o.users;
        const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
        const items = o.order_item || [];
        const firstItem = items[0];
        const produk = firstItem
          ? Array.isArray(firstItem.produk)
            ? firstItem.produk[0]
            : firstItem.produk
          : null;
        const pengiriman = Array.isArray(o.pengiriman) ? o.pengiriman[0] : o.pengiriman;
        const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
        const orderChat = Array.isArray(o.order_chat) ? o.order_chat[0] : o.order_chat;
        const paymentInfo = getOrderPaymentDisplay({
          tipe_pembayaran: o.tipe_pembayaran,
          metod_pay: payment?.metod_pay,
          kurir: pengiriman?.kurir,
          catatan: o.catatan,
        });
        const status = mapOrderStatus(o.stat_order, payment?.stat_pay);
        const needsShippingChat =
          paymentInfo.kind === "digital" &&
          payment?.stat_pay === "success" &&
          (status === "Perlu Dikirim" || status === "Dikirim");
        const buyerName = user?.nama_lengkap || "Pembeli";
        const totalQty = items.reduce((s: number, i) => s + (i.qty_orderitem || 1), 0);

        return {
          id: formatOrderId(o.id_order),
          uuid: o.id_order,
          date: formatDateId(o.created_at, true),
          buyer: buyerName,
          avatar: initials(buyerName),
          storeName: seller?.nm_store || "Toko UMKM",
          productName: produk?.nama_produk || "Produk",
          productDetail:
            items.length > 1
              ? `${items.length} item (${totalQty} pcs)`
              : `${firstItem?.qty_orderitem || 1} pcs`,
          productImg: parseProductImg(produk?.img),
          total: Number(o.total_hrg),
          status,
          paymentLabel: paymentInfo.label,
          paymentDesc: paymentInfo.desc,
          paymentKind: paymentInfo.kind,
          chatId: orderChat?.id_chat || null,
          needsShippingChat,
        };
      });
    } catch (err) {
      console.error("adminService.getOrders failed:", err);
      return [];
    }
  },

  async getPendingShippingChatCount(): Promise<number> {
    if (isPlaceholder()) return 0;
    try {
      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, stat_order, tipe_pembayaran,
          payment ( stat_pay, metod_pay ),
          pengiriman ( kurir )
        `)
        .eq("tipe_pembayaran", "digital")
        .in("stat_order", ["diproses", "dikirim", "pending"]);

      if (error || !data) return 0;

      return data.filter((o) => {
        const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
        const pengiriman = Array.isArray(o.pengiriman) ? o.pengiriman[0] : o.pengiriman;
        const pay = getOrderPaymentDisplay({
          tipe_pembayaran: o.tipe_pembayaran,
          metod_pay: payment?.metod_pay,
          kurir: pengiriman?.kurir,
        });
        return pay.kind === "digital" && payment?.stat_pay === "success";
      }).length;
    } catch {
      return 0;
    }
  },

  async updateOrderStatus(orderId: string, statOrder: string): Promise<boolean> {
    if (isPlaceholder()) return false;
    try {
      const { error } = await supabase
        .from("order")
        .update({ stat_order: statOrder })
        .eq("id_order", orderId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("adminService.updateOrderStatus failed:", err);
      return false;
    }
  },

  async getShipments(): Promise<AdminShipmentOrder[]> {
    if (isPlaceholder()) return [];

    try {
      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, stat_order, created_at, tipe_pembayaran, catatan,
          users ( nama_lengkap ),
          seller ( nm_store ),
          alamat ( detail_alamat, kota, provinsi, kode_pos ),
          order_item (
            qty_orderitem,
            produk ( nama_produk )
          ),
          payment ( stat_pay, metod_pay ),
          pengiriman ( kurir, no_resi, estimasi_tiba, stat_kirim )
        `)
        .not("stat_order", "eq", "dibatalkan")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      if (!data?.length) return [];

      return data
        .filter((o) => {
          const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
          if (o.stat_order === "pending" && payment?.stat_pay !== "success") return false;
          return ["diproses", "dikirim", "selesai", "pending"].includes(o.stat_order);
        })
        .map((o) => {
          const user = Array.isArray(o.users) ? o.users[0] : o.users;
          const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
          const alamat = Array.isArray(o.alamat) ? o.alamat[0] : o.alamat;
          const items = o.order_item || [];
          const pengiriman = Array.isArray(o.pengiriman) ? o.pengiriman[0] : o.pengiriman;
          const payment = Array.isArray(o.payment) ? o.payment[0] : o.payment;
          const paymentInfo = getOrderPaymentDisplay({
            tipe_pembayaran: o.tipe_pembayaran,
            metod_pay: payment?.metod_pay,
            kurir: pengiriman?.kurir,
            catatan: o.catatan,
          });
          const firstItem = items[0];
          const produk = firstItem
            ? Array.isArray(firstItem.produk)
              ? firstItem.produk[0]
              : firstItem.produk
            : null;
          const totalQty = items.reduce((s: number, i) => s + (i.qty_orderitem || 1), 0);
          const addressText = alamat
            ? `${alamat.detail_alamat}, ${alamat.kota}, ${alamat.provinsi}${alamat.kode_pos ? ` ${alamat.kode_pos}` : ""}`
            : "Alamat tidak tersedia";

          return {
            id: formatOrderId(o.id_order),
            uuid: o.id_order,
            buyer: user?.nama_lengkap || "Pembeli",
            storeName: seller?.nm_store || "Toko UMKM",
            product: produk?.nama_produk || "Produk",
            qty: totalQty,
            address: addressText,
            date: formatDateId(o.created_at),
            status: mapShipStatus(o.stat_order, pengiriman?.stat_kirim),
            courier: pengiriman?.kurir,
            resi: pengiriman?.no_resi,
            eta: pengiriman?.estimasi_tiba
              ? formatDateId(pengiriman.estimasi_tiba)
              : undefined,
            paymentLabel: paymentInfo.label,
            paymentDesc: paymentInfo.desc,
            paymentKind: paymentInfo.kind,
          };
        });
    } catch (err) {
      console.error("adminService.getShipments failed:", err);
      return [];
    }
  },

  async getTransactions(): Promise<
    {
      id: string;
      date: string;
      buyer: string;
      email: string;
      avatar: string;
      amount: number;
      status: string;
    }[]
  > {
    if (isPlaceholder()) return [];

    try {
      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, created_at, total_hrg, stat_order,
          users ( nama_lengkap, email )
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map((item: Record<string, unknown>) => {
        const user = Array.isArray(item.users) ? item.users[0] : item.users;
        const u = user as { nama_lengkap?: string; email?: string } | null;
        const buyer = u?.nama_lengkap || "Tanpa Nama";
        return {
          id: item.id_order as string,
          date: formatDateId(item.created_at as string, true),
          buyer,
          email: u?.email || "-",
          amount: Number(item.total_hrg),
          status: item.stat_order as string,
          avatar: initials(buyer),
        };
      });
    } catch (err) {
      console.error("adminService.getTransactions failed:", err);
      return [];
    }
  },

  async getReportStats(): Promise<{
    totalRevenue: number;
    activeSellers: number;
    totalOrders: number;
    customerRating: number;
  }> {
    if (isPlaceholder()) {
      return { totalRevenue: 0, activeSellers: 0, totalOrders: 0, customerRating: 0 };
    }

    try {
      const [{ count: sellerCount }, { count: orderCount }, { data: doneOrders }, { data: reviews }] =
        await Promise.all([
          supabase.from("seller").select("*", { count: "exact", head: true }),
          supabase.from("order").select("*", { count: "exact", head: true }),
          supabase.from("order").select("total_hrg").eq("stat_order", "selesai"),
          supabase.from("review").select("rating"),
        ]);

      const totalRevenue =
        doneOrders?.reduce((s, o) => s + Number(o.total_hrg), 0) ?? 0;
      const customerRating =
        reviews?.length
          ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
          : 0;

      return {
        totalRevenue,
        activeSellers: sellerCount ?? 0,
        totalOrders: orderCount ?? 0,
        customerRating: Math.round(customerRating * 10) / 10,
      };
    } catch (err) {
      console.error("adminService.getReportStats failed:", err);
      return { totalRevenue: 0, activeSellers: 0, totalOrders: 0, customerRating: 0 };
    }
  },

  async getWeeklyRevenueChart(): Promise<{ label: string; amount: number }[]> {
    if (isPlaceholder()) return [];

    try {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("order")
        .select("total_hrg, created_at, stat_order")
        .gte("created_at", since.toISOString());

      if (error) throw error;

      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const buckets = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        buckets.set(dayNames[d.getDay()], 0);
      }

      for (const row of data || []) {
        if (row.stat_order === "dibatalkan") continue;
        const d = new Date(row.created_at);
        const key = dayNames[d.getDay()];
        buckets.set(key, (buckets.get(key) || 0) + Number(row.total_hrg));
      }

      return Array.from(buckets.entries()).map(([label, amount]) => ({ label, amount }));
    } catch (err) {
      console.error("adminService.getWeeklyRevenueChart failed:", err);
      return [];
    }
  },

  async getTopStores(limit = 5): Promise<
    {
      nama: string;
      lokasi: string;
      kategori: string;
      pesanan: number;
      omzet: number;
      rating: number;
      status: string;
      logo: string;
    }[]
  > {
    if (isPlaceholder()) return [];

    try {
      const { data: orders, error } = await supabase
        .from("order")
        .select(`
          total_hrg, stat_order,
          seller ( id_seller, nm_store, addr, is_verified )
        `)
        .neq("stat_order", "dibatalkan");

      if (error) throw error;

      const storeMap = new Map<
        string,
        { nama: string; lokasi: string; kategori: string; pesanan: number; omzet: number }
      >();

      for (const o of orders || []) {
        const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
        if (!seller?.id_seller) continue;
        const cur = storeMap.get(seller.id_seller) || {
          nama: seller.nm_store || "Toko",
          lokasi: seller.addr?.split(",")[0] || "-",
          kategori: "UMKM",
          pesanan: 0,
          omzet: 0,
        };
        cur.pesanan += 1;
        cur.omzet += Number(o.total_hrg);
        storeMap.set(seller.id_seller, cur);
      }

      const sellerIds = Array.from(storeMap.keys());
      const ratings = new Map<string, number>();
      if (sellerIds.length) {
        const { data: storeReviews } = await supabase
          .from("review_toko")
          .select("id_seller, rating")
          .in("id_seller", sellerIds);
        const sums = new Map<string, { total: number; count: number }>();
        for (const r of storeReviews || []) {
          const s = sums.get(r.id_seller) || { total: 0, count: 0 };
          s.total += Number(r.rating);
          s.count += 1;
          sums.set(r.id_seller, s);
        }
        for (const [id, s] of sums) {
          ratings.set(id, Math.round((s.total / s.count) * 10) / 10);
        }
      }

      return Array.from(storeMap.entries())
        .map(([id, s]) => ({
          ...s,
          pesanan: s.pesanan,
          omzet: s.omzet,
          rating: ratings.get(id) || 4.5,
          status: "Aktif",
          logo: "/product-keramik.png",
        }))
        .sort((a, b) => b.omzet - a.omzet)
        .slice(0, limit);
    } catch (err) {
      console.error("adminService.getTopStores failed:", err);
      return [];
    }
  },
};
