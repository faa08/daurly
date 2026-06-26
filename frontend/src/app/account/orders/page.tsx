"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Loader2, X } from "lucide-react";
import { authService } from "@/backend/authService";
import { supabase } from "@/backend/supabase";
import { returnService, ReturnItem } from "@/backend/returnService";
import { RETURN_EVIDENCE_GUIDE, RETURN_EVIDENCE_NOTE } from "@/lib/returnConstants";

type OrderItem = {
  id_order_item: string;
  qty_orderitem: number;
  hrg_saat_beli: number;
  produk: { id_produk: string; nama_produk: string; cover_img?: string | null; img?: string | null } | null;
};

type Order = {
  id_order: string;
  created_at: string;
  stat_order: string;
  total_hrg: number;
  ongkir: number;
  tipe_pembayaran?: string | null;
  items: OrderItem[];
  pengiriman: { kurir: string; no_resi: string | null; stat_kirim?: string } | null;
  seller?: { nm_store: string } | null;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "Belum Bayar", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  diproses:   { label: "Diproses",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  dikirim:    { label: "Dikirim",     color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  selesai:    { label: "Selesai",     color: "bg-green-50 text-green-700 border-green-200" },
  dibatalkan: { label: "Dibatalkan",  color: "bg-red-50 text-red-700 border-red-200" },
};

const RETURN_STATUS: Record<string, string> = {
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

const TABS = ["Semua", "Belum Bayar", "Diproses", "Dikirim", "Selesai", "Return", "Dibatalkan"];

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img);
      return arr[0] || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

function normalizePengiriman(raw: unknown): Order["pengiriman"] {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw as Order["pengiriman"];
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [reviewModal, setReviewModal] = useState<{
    orderId: string;
    productId: string;
    productName: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [returnModal, setReturnModal] = useState<{
    orderItemId: string;
    productName: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/masuk?redirect=/account/orders");
      return;
    }

    if (isPlaceholder()) {
      setOrders([]);
      setReturns([]);
      setLoading(false);
      return;
    }

    const [ordersRes, returnsList] = await Promise.all([
      supabase
        .from("order")
        .select(`
          id_order, created_at, stat_order, total_hrg, ongkir, tipe_pembayaran,
          seller ( nm_store ),
          order_item (
            id_order_item, qty_orderitem, hrg_saat_beli,
            produk ( id_produk, nama_produk, cover_img )
          ),
          pengiriman ( kurir, no_resi, stat_kirim )
        `)
        .eq("id_user", user.id_user)
        .order("created_at", { ascending: false }),
      returnService.listReturns(user.id_user),
    ]);

    if (ordersRes.error) {
      console.error("Gagal memuat pesanan:", ordersRes.error.message);
    } else if (ordersRes.data) {
      const mapped = ordersRes.data.map((o: Record<string, unknown>) => ({
        ...o,
        items: (o.order_item as OrderItem[]) || [],
        pengiriman: normalizePengiriman(o.pengiriman),
        seller: Array.isArray(o.seller) ? o.seller[0] : o.seller,
      })) as Order[];
      setOrders(mapped);

      const productIds = mapped
        .flatMap((o) => o.items.map((i) => i.produk?.id_produk).filter(Boolean) as string[]);
      const reviewed = await returnService.getReviewedProductIds(user.id_user, productIds);
      setReviewedIds(new Set(reviewed));
    }

    setReturns(returnsList);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "Return") return false;
    if (activeTab === "Semua") return true;
    const label = STATUS_MAP[o.stat_order]?.label;
    return label === activeTab;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const formatOrderId = (id: string) =>
    `ORD-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const canMarkComplete = (ord: Order) => {
    const isPickup = ord.pengiriman?.kurir === "Ambil di Toko";
    return ord.stat_order === "dikirim" || (isPickup && ord.stat_order === "diproses");
  };

  const handleCompleteOrder = async (orderId: string) => {
    const user = authService.getCurrentUser();
    if (!user) return;
    setActionLoading(orderId);
    try {
      await returnService.completeOrder(orderId, user.id_user);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyelesaikan pesanan.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user || !reviewModal) return;
    setReviewSubmitting(true);
    try {
      await returnService.submitReview({
        userId: user.id_user,
        orderId: reviewModal.orderId,
        productId: reviewModal.productId,
        rating: reviewRating,
        comment: reviewText,
      });
      setReviewedIds((prev) => new Set([...prev, reviewModal.productId]));
      setReviewModal(null);
      setReviewText("");
      setReviewRating(5);
      alert("Ulasan berhasil dikirim! Ulasan akan tampil di halaman produk.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengirim ulasan.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user || !returnModal) return;
    setReturnSubmitting(true);
    try {
      const idRetur = await returnService.submitReturn(
        user.id_user,
        returnModal.orderItemId,
        returnReason
      );
      setReturnModal(null);
      setReturnReason("");
      setActiveTab("Return");
      await loadData();
      router.push(`/account/orders/return/${idRetur}/chat`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengajukan return.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pesanan Saya</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Pantau status transaksi, beri ulasan, dan ajukan return.
        </p>
      </header>

      <section className="bg-white border border-surface-container rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
              activeTab === tab
                ? "bg-primary text-white"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            {tab}
            {tab === "Return" && returns.length > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{returns.length}</span>
            )}
          </button>
        ))}
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="bg-white border border-surface-container p-12 rounded-xl text-center text-secondary text-sm shadow-sm">
            Memuat pesanan...
          </div>
        ) : activeTab === "Return" ? (
          returns.length === 0 ? (
            <div className="bg-white border border-surface-container p-12 rounded-xl text-center shadow-sm">
              <p className="text-secondary text-sm">Belum ada pengajuan return.</p>
              <p className="text-xs text-secondary mt-2">Ajukan return dari tab Selesai setelah pesanan selesai.</p>
            </div>
          ) : (
            returns.map((ret) => {
              const item = Array.isArray(ret.order_item) ? ret.order_item[0] : ret.order_item;
              const produk = item?.produk
                ? Array.isArray(item.produk) ? item.produk[0] : item.produk
                : null;
              return (
                <div key={ret.id_retur} className="bg-white border border-surface-container rounded-xl p-6 shadow-sm">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-surface-container rounded overflow-hidden shrink-0">
                        <img
                          src={parseProductImg(produk?.cover_img || produk?.img)}
                          alt={produk?.nama_produk ?? "Produk"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{produk?.nama_produk ?? "Produk"}</p>
                        <p className="text-xs text-secondary mt-1 line-clamp-2">{ret.alasan}</p>
                        <p className="text-[10px] text-secondary mt-1">{formatDate(ret.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border bg-orange-50 text-orange-700 border-orange-200">
                        {RETURN_STATUS[ret.status] || ret.status}
                      </span>
                      <Link
                        href={`/account/orders/return/${ret.id_retur}/chat`}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
                      >
                        Chat Admin
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-surface-container p-12 rounded-xl text-center shadow-sm space-y-3">
            <p className="text-secondary text-sm">
              {activeTab === "Semua" ? "Belum ada pesanan." : "Tidak ada transaksi di status ini."}
            </p>
            {activeTab === "Semua" && (
              <Link href="/" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-95 transition">
                Mulai Belanja
              </Link>
            )}
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const statusInfo = STATUS_MAP[ord.stat_order] ?? {
              label: ord.stat_order,
              color: "bg-gray-50 text-gray-700 border-gray-200",
            };
            const firstItem = ord.items[0];
            const isPickup = ord.pengiriman?.kurir === "Ambil di Toko";

            return (
              <div key={ord.id_order} className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-semibold text-secondary border-b border-surface-container pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-on-surface">{formatOrderId(ord.id_order)}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>{formatDate(ord.created_at)}</span>
                    {ord.seller?.nm_store && (
                      <>
                        <span className="hidden sm:inline">|</span>
                        <span className="text-[#8E8680]">{ord.seller.nm_store}</span>
                      </>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {firstItem ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-surface-container rounded overflow-hidden shrink-0">
                        <img
                          src={parseProductImg(firstItem.produk?.cover_img || firstItem.produk?.img)}
                          alt={firstItem.produk?.nama_produk ?? "Produk"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-sm text-on-surface leading-tight">
                          {firstItem.produk?.nama_produk ?? "Produk dihapus"}
                          {ord.items.length > 1 && (
                            <span className="text-secondary font-normal"> +{ord.items.length - 1} produk lainnya</span>
                          )}
                        </h4>
                        <p className="text-[10px] text-secondary font-bold">
                          {firstItem.qty_orderitem} x Rp {Number(firstItem.hrg_saat_beli).toLocaleString("id-ID")}
                        </p>
                        {ord.pengiriman && (
                          <p className="text-[10px] font-semibold text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">{isPickup ? "store" : "local_shipping"}</span>
                            {ord.pengiriman.kurir}
                            {ord.pengiriman.no_resi ? ` · ${ord.pengiriman.no_resi}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between md:items-end gap-3 text-right">
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Belanja</p>
                        <p className="font-headline font-extrabold text-base text-primary">
                          Rp {Number(ord.total_hrg).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {ord.tipe_pembayaran === "digital" &&
                          ["diproses", "dikirim", "selesai"].includes(ord.stat_order) && (
                          <Link href={`/account/orders/${ord.id_order}/chat`} className="px-4 py-2 border border-primary text-primary font-bold text-xs rounded hover:bg-primary-container transition">
                            Chat Pengiriman
                          </Link>
                        )}

                        {canMarkComplete(ord) && (
                          <button
                            onClick={() => handleCompleteOrder(ord.id_order)}
                            disabled={actionLoading === ord.id_order}
                            className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded hover:brightness-95 transition disabled:opacity-60 flex items-center gap-1"
                          >
                            {actionLoading === ord.id_order ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            Pesanan Selesai
                          </button>
                        )}

                        {ord.stat_order === "selesai" && ord.items.map((item) => {
                          const pid = item.produk?.id_produk;
                          if (!pid) return null;
                          const reviewed = reviewedIds.has(pid);
                          return (
                            <div key={item.id_order_item} className="flex gap-2">
                              {!reviewed ? (
                                <button
                                  onClick={() =>
                                    setReviewModal({
                                      orderId: ord.id_order,
                                      productId: pid,
                                      productName: item.produk?.nama_produk || "Produk",
                                    })
                                  }
                                  className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded hover:brightness-95 transition"
                                >
                                  Beri Ulasan
                                </button>
                              ) : (
                                <span className="px-3 py-2 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded">
                                  ✓ Sudah Diulas
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  setReturnModal({
                                    orderItemId: item.id_order_item,
                                    productName: item.produk?.nama_produk || "Produk",
                                  })
                                }
                                className="px-4 py-2 border-2 border-orange-500 text-orange-600 font-bold text-xs rounded hover:bg-orange-50 transition"
                              >
                                Ajukan Return
                              </button>
                            </div>
                          );
                        })}

                        {(ord.stat_order === "pending" || (ord.stat_order === "diproses" && !canMarkComplete(ord))) && (
                          <span className="text-[10px] font-bold text-secondary uppercase">
                            {ord.stat_order === "pending" ? "Menunggu pembayaran" : "Sedang diproses penjual"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-secondary">Detail produk tidak tersedia.</p>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Beri Ulasan</h3>
              <button onClick={() => setReviewModal(null)} className="text-secondary hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">{reviewModal.productName}</p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-0.5">
                    <Star size={22} fill={s <= reviewRating ? "#F59E0B" : "none"} color={s <= reviewRating ? "#F59E0B" : "#D5CFC9"} />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                className="w-full border border-surface-container-high rounded-lg p-3 text-sm outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full h-11 bg-primary text-white font-bold rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {reviewSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Kirim Ulasan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h3 className="font-bold text-lg">Ajukan Return</h3>
              <button onClick={() => setReturnModal(null)} className="text-secondary hover:text-on-surface">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">{returnModal.productName}</p>

            <div className="mb-5 rounded-lg border border-orange-200 bg-orange-50/60 p-4 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
                Bukti yang perlu disiapkan
              </p>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {RETURN_EVIDENCE_GUIDE.map((section) => (
                  <div key={section.title}>
                    <p
                      className={`text-xs font-bold mb-1 ${
                        section.highlight ? "text-orange-700" : "text-on-surface"
                      }`}
                    >
                      {section.highlight && "★ "}
                      {section.title}
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-secondary space-y-0.5 pl-1">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-orange-800/80 leading-relaxed border-t border-orange-200 pt-2">
                {RETURN_EVIDENCE_NOTE}
              </p>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Alasan return</label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Jelaskan alasan return (rusak, tidak sesuai, kelengkapan kurang, dll.)..."
                  className="w-full border border-surface-container-high rounded-lg p-3 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={returnSubmitting}
                className="w-full h-11 bg-orange-500 text-white font-bold rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {returnSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Ajukan & Chat Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
