import { supabase } from "./supabase";
import { apiFetch } from "@/lib/api-client";
import { getOrderPaymentDisplay, type OrderPaymentKind } from "@/lib/checkoutConstants";
import { fetchAdminOrderRows, fetchAdminShipmentRows, formatDbError, mapAdminOrderRow, mapAdminShipmentRow } from "@/lib/adminOrderMapping";

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
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  shipLat: number | null;
  shipLng: number | null;
  buktiBayar?: string | null;
  statPay?: string | null;
}

export type AdminShipStatus = "Perlu Dikirim" | "Sedang Dikirim" | "Selesai";

export interface AdminShipmentOrder {
  id: string;
  uuid: string;
  buyer: string;
  storeName: string;
  product: string;
  productImg: string;
  qty: number;
  address: string;
  date: string;
  status: AdminShipStatus;
  shipLat: number | null;
  shipLng: number | null;
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
            storeName: seller?.nm_store || "Toko Daur Ulang",
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
            storeName: seller?.nm_store || "Toko Daur Ulang",
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
      const res = await apiFetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        return (data.orders || []) as AdminOrder[];
      }
      const errBody = await res.json().catch(() => ({}));
      console.warn("admin orders API:", res.status, (errBody as { error?: string }).error);
    } catch (err) {
      console.warn("admin orders API unreachable:", formatDbError(err));
    }

    try {
      const rows = await fetchAdminOrderRows(supabase);
      if (!rows.length) return [];
      return rows.map((o) => mapAdminOrderRow(o));
    } catch (err) {
      console.error("adminService.getOrders failed:", formatDbError(err));
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

  async confirmPickupOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
    if (isPlaceholder()) return { ok: false, error: "Supabase belum dikonfigurasi." };
    try {
      const res = await apiFetch("/api/admin/orders/confirm-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Gagal mengonfirmasi pickup." };
      return { ok: true };
    } catch (err) {
      console.error("adminService.confirmPickupOrder failed:", err);
      return { ok: false, error: "Gagal mengonfirmasi pickup." };
    }
  },

  async getShipments(): Promise<AdminShipmentOrder[]> {
    if (isPlaceholder()) return [];

    try {
      const res = await apiFetch("/api/admin/orders?view=shipments");
      if (res.ok) {
        const data = await res.json();
        return (data.shipments || []) as AdminShipmentOrder[];
      }
    } catch {
      /* fallback below */
    }

    try {
      const rows = await fetchAdminShipmentRows(supabase);
      return rows
        .map((o) => mapAdminShipmentRow(o))
        .filter((row): row is AdminShipmentOrder => row != null);
    } catch (err) {
      console.error("adminService.getShipments failed:", formatDbError(err));
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
      storeName: string;
      createdRaw: string;
    }[]
  > {
    if (isPlaceholder()) return [];

    try {
      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, created_at, total_hrg, stat_order,
          users ( nama_lengkap, email ),
          seller ( nm_store )
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map((item: Record<string, unknown>) => {
        const user = Array.isArray(item.users) ? item.users[0] : item.users;
        const u = user as { nama_lengkap?: string; email?: string } | null;
        const buyer = u?.nama_lengkap || "Tanpa Nama";
        const sellerObj = Array.isArray(item.seller) ? item.seller[0] : item.seller;
        const s = sellerObj as { nm_store?: string } | null;
        return {
          id: item.id_order as string,
          date: formatDateId(item.created_at as string, true),
          buyer,
          email: u?.email || "-",
          amount: Number(item.total_hrg),
          status: item.stat_order as string,
          avatar: initials(buyer),
          storeName: s?.nm_store || "Toko Daur Ulang",
          createdRaw: item.created_at as string,
        };
      });
    } catch (err) {
      console.error("adminService.getTransactions failed:", err);
      return [];
    }
  },

  async getTransactionDetails(idOrder: string): Promise<any | null> {
    if (isPlaceholder()) return null;

    try {
      const { data: order, error: orderError } = await supabase
        .from("order")
        .select(`
          id_order, created_at, total_hrg, ongkir, diskon, biaya_layanan, stat_order, tipe_pembayaran, catatan,
          users ( nama_lengkap, email, no_telp ),
          seller ( nm_store, email, no_telp ),
          alamat ( label, nama_penerima, no_telp, provinsi, kota, kecamatan, kode_pos, detail_alamat )
        `)
        .eq("id_order", idOrder)
        .maybeSingle();

      if (orderError || !order) throw orderError || new Error("Order tidak ditemukan.");

      const { data: items, error: itemsError } = await supabase
        .from("order_item")
        .select("id_order_item, id_produk, qty_orderitem, hrg_saat_beli, nama_produk_snapshot, img_snapshot")
        .eq("id_order", idOrder);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: items || []
      };
    } catch (err) {
      console.error("adminService.getTransactionDetails failed:", err);
      return null;
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
          seller ( id_seller, nm_store, addr, is_verified, logo_toko )
        `)
        .neq("stat_order", "dibatalkan");

      if (error) throw error;

      const storeMap = new Map<
        string,
        {
          nama: string;
          lokasi: string;
          kategori: string;
          pesanan: number;
          omzet: number;
          logo: string;
          isVerified: boolean;
        }
      >();

      const defaultLogo =
        "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop";

      for (const o of orders || []) {
        const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
        if (!seller?.id_seller) continue;
        const cur = storeMap.get(seller.id_seller) || {
          nama: seller.nm_store || "Toko",
          lokasi: seller.addr?.split(",")[0] || "Indonesia",
          kategori: "Daur Ulang",
          pesanan: 0,
          omzet: 0,
          logo: seller.logo_toko?.trim() || defaultLogo,
          isVerified: Boolean(seller.is_verified),
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
          nama: s.nama,
          lokasi: s.lokasi,
          kategori: s.kategori,
          pesanan: s.pesanan,
          omzet: s.omzet,
          rating: ratings.get(id) || 4.5,
          status: s.isVerified ? "Aktif" : "Nonaktif",
          logo: s.logo,
        }))
        .sort((a, b) => b.omzet - a.omzet)
        .slice(0, limit);
    } catch (err) {
      console.error("adminService.getTopStores failed:", err);
      return [];
    }
  },

  async getOrderItemsForOrders(orderIds: string[]): Promise<any[]> {
    if (isPlaceholder() || orderIds.length === 0) return [];
    try {
      const { data, error } = await supabase
        .from("order_item")
        .select("id_order, nama_produk_snapshot, qty_orderitem, hrg_saat_beli")
        .in("id_order", orderIds);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("adminService.getOrderItemsForOrders failed:", err);
      return [];
    }
  },

  async confirmDigitalPayment(orderId: string): Promise<boolean> {
    if (isPlaceholder()) return false;
    try {
      const now = new Date().toISOString();
      
      // 1. Update payment status to success
      const { error: payErr } = await supabase
        .from("payment")
        .update({ stat_pay: "success", tgl_pay: now })
        .eq("id_order", orderId);
      
      if (payErr) throw payErr;
      
      // 2. Update order status to diproses (translated to Perlu Dikirim in admin panel)
      const { error: orderErr } = await supabase
        .from("order")
        .update({ stat_order: "diproses", updated_at: now })
        .eq("id_order", orderId);
      
      if (orderErr) throw orderErr;

      // 3. Deduct stock inventory for products in this order
      const { data: items } = await supabase
        .from("order_item")
        .select("id_produk, qty_orderitem")
        .eq("id_order", orderId);

      if (items) {
        for (const item of items) {
          if (!item.id_produk) continue;
          
          const { data: prod } = await supabase
            .from("produk")
            .select("produk_stock")
            .eq("id_produk", item.id_produk)
            .maybeSingle();

          if (prod) {
            const newStock = Math.max(0, Number(prod.produk_stock) - Number(item.qty_orderitem));
            await supabase
              .from("produk")
              .update({ produk_stock: newStock })
              .eq("id_produk", item.id_produk);
          }
        }
      }

      // 4. Send customer notification
      const { data: orderData } = await supabase
        .from("order")
        .select("id_user")
        .eq("id_order", orderId)
        .maybeSingle();

      if (orderData?.id_user) {
        await supabase.from("notifikasi").insert({
          id_user: orderData.id_user,
          judul: "Pembayaran Dikonfirmasi",
          pesan: "Pembayaran QRIS untuk pesanan Anda telah berhasil dikonfirmasi oleh admin. Pesanan kini sedang diproses.",
          tipe: "payment",
          link: "/account/orders",
          id_order: orderId,
          is_read: false,
        });
      }

      return true;
    } catch (err) {
      console.error("adminService.confirmDigitalPayment failed:", err);
      return false;
    }
  },

  async getPendingAffiliates(): Promise<any[]> {
    if (isPlaceholder()) return [];
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id_user, username, nama_lengkap, email, affiliate_status, affiliate_phone, affiliate_social, affiliate_nik, affiliate_ktp_name, created_at")
        .neq("affiliate_status", "none")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("adminService.getPendingAffiliates failed:", err);
      return [];
    }
  },

  async reviewAffiliate(userId: string, approve: boolean): Promise<boolean> {
    if (isPlaceholder()) return false;
    try {
      const status = approve ? "approved" : "rejected";
      
      const updateData: any = {
        affiliate_status: status,
      };

      if (approve) {
        updateData.is_affiliate = true;
        
        const { data: user } = await supabase
          .from("users")
          .select("username")
          .eq("id_user", userId)
          .maybeSingle();
        
        const base = (user?.username || "USER").substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, "");
        const digits = Math.floor(1000 + Math.random() * 9000);
        updateData.affiliate_code = `AFF-${base}-${digits}`;
      } else {
        updateData.is_affiliate = false;
        updateData.affiliate_code = null;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id_user", userId);

      if (error) throw error;

      await supabase.from("notifikasi").insert({
        id_user: userId,
        judul: approve ? "Pendaftaran Affiliate Disetujui! 🎉" : "Pendaftaran Affiliate Ditolak",
        pesan: approve
          ? `Selamat! Pendaftaran affiliate Anda telah disetujui oleh admin. Kode affiliate Anda adalah: ${updateData.affiliate_code}. Anda sekarang bisa mulai mempromosikan produk dan mendapatkan komisi!`
          : "Maaf, pendaftaran affiliate Anda ditolak oleh admin karena belum memenuhi kriteria verifikasi. Silakan hubungi kami untuk informasi lebih lanjut.",
        tipe: "info",
        link: "/affiliate",
        is_read: false,
      });

      return true;
    } catch (err) {
      console.error("adminService.reviewAffiliate failed:", err);
      return false;
    }
  },

  async deactivateAffiliate(userId: string): Promise<boolean> {
    if (isPlaceholder()) return false;
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_affiliate: false,
          affiliate_status: "rejected",
          affiliate_code: null,
        })
        .eq("id_user", userId);

      if (error) throw error;

      await supabase.from("notifikasi").insert({
        id_user: userId,
        judul: "Akun Affiliate Dinonaktifkan ⚠️",
        pesan: "Akun partner affiliate Anda telah dinonaktifkan oleh admin Daurly. Silakan hubungi Customer Service untuk informasi lebih lanjut.",
        tipe: "info",
        link: "/affiliate",
        is_read: false,
      });

      return true;
    } catch (err) {
      console.error("adminService.deactivateAffiliate failed:", err);
      return false;
    }
  },

  async deleteUserAccount(userId: string): Promise<boolean> {
    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.filter((u: any) => u.id_user !== userId);
          localStorage.setItem("pelum_users", JSON.stringify(updatedUsers));
        } catch (e) {
          console.error("Failed to parse local stored users:", e);
        }
      }
      return true;
    }

    try {
      const res = await apiFetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus akun.");
      }
      return true;
    } catch (err) {
      console.error("adminService.deleteUserAccount failed:", err);
      return false;
    }
  },

  async getUsers(): Promise<any[]> {
    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      return storedUsers ? JSON.parse(storedUsers) : [];
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id_user, username, nama_lengkap, email, no_telp, avatar, role, created_at, jenis_kelamin, tanggal_lahir, is_affiliate")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("adminService.getUsers failed:", err);
      return [];
    }
  },

  async updateUserRole(userId: string, newRole: "customer" | "seller" | "admin" | "tester"): Promise<boolean> {
    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updated = users.map((u: any) => u.id_user === userId ? { ...u, role: newRole } : u);
          localStorage.setItem("pelum_users", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update user role in localStorage:", e);
        }
      }
      return true;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id_user", userId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("adminService.updateUserRole failed:", err);
      return false;
    }
  },

  async suspendUserAccount(userId: string, suspend: boolean): Promise<boolean> {
    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updated = users.map((u: any) => u.id_user === userId ? { ...u, is_suspended: suspend } : u);
          localStorage.setItem("pelum_users", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to update user suspension in localStorage:", e);
        }
      }
      return true;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_suspended: suspend })
        .eq("id_user", userId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("adminService.suspendUserAccount failed:", err);
      return false;
    }
  },

  async deleteTesterAccount(userId: string): Promise<boolean> {
    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        try {
          const users = JSON.parse(storedUsers);
          const updatedUsers = users.filter((u: any) => u.id_user !== userId);
          localStorage.setItem("pelum_users", JSON.stringify(updatedUsers));
        } catch (e) {
          console.error("Failed to delete local tester user:", e);
        }
      }
      return true;
    }

    try {
      const res = await apiFetch("/api/admin/users/delete-tester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus akun tester.");
      }
      return true;
    } catch (err) {
      console.error("adminService.deleteTesterAccount failed:", err);
      return false;
    }
  }
};
