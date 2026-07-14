"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, MessageCircle, Store, MapPin } from "lucide-react";
import { adminService, type AdminOrder } from "@/backend/adminService";
import { shippingService } from "@/backend/shippingService";
import ShippingMapModal from "@/components/ShippingMapModal";
import { getPaymentBadgeClass } from "@/lib/checkoutConstants";

type MapViewState = {
  title: string;
  addressText: string;
  lat: number | null;
  lng: number | null;
  isPickup: boolean;
} | null;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [confirmingPickup, setConfirmingPickup] = useState<string | null>(null);
  const [mapView, setMapView] = useState<MapViewState>(null);

  const tabs = ["Semua", "Belum Bayar", "Perlu Dikirim", "Dikirim", "Selesai", "Dibatalkan"];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } catch {
      setError("Gagal memuat data pesanan dari database.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShipOrder = async (uuid: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.uuid === uuid ? { ...o, status: "Dikirim" } : o))
    );
    const updated = await adminService.updateOrderStatus(uuid, "dikirim");
    if (updated) {
      await shippingService.createShipment(uuid, "JNE");
    } else {
      fetchOrders();
    }
  };

  const handleCompleteOrder = async (uuid: string) => {
    const updated = await adminService.updateOrderStatus(uuid, "selesai");
    if (updated) fetchOrders();
  };

  const handleConfirmPickup = async (uuid: string, buyer: string) => {
    const ok = window.confirm(
      `Konfirmasi pesanan pickup dari ${buyer} sudah diambil & dibayar di toko?`
    );
    if (!ok) return;

    setConfirmingPickup(uuid);
    const result = await adminService.confirmPickupOrder(uuid);
    setConfirmingPickup(null);

    if (result.ok) {
      fetchOrders();
    } else {
      alert(result.error || "Gagal mengonfirmasi pickup.");
    }
  };

  const handleConfirmDigitalPayment = async (uuid: string, buyer: string) => {
    const ok = window.confirm(`Konfirmasi pembayaran QRIS dari ${buyer} sudah lunas dan sesuai?`);
    if (!ok) return;

    setConfirmingPickup(uuid);
    const success = await adminService.confirmDigitalPayment(uuid);
    setConfirmingPickup(null);

    if (success) {
      fetchOrders();
    } else {
      alert("Gagal mengonfirmasi pembayaran digital.");
    }
  };

  const needShippingCount = orders.filter((o) => o.status === "Perlu Dikirim").length;
  const needPickupCount = orders.filter(
    (o) => o.status === "Perlu Dikirim" && o.paymentKind === "pickup"
  ).length;
  const needChatCount = orders.filter((o) => o.needsShippingChat).length;

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === "Semua" || o.status === activeTab;
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-8">
      <ShippingMapModal
        open={!!mapView}
        onClose={() => setMapView(null)}
        title={mapView?.title || "Lokasi Pengiriman"}
        addressText={mapView?.addressText || ""}
        lat={mapView?.lat}
        lng={mapView?.lng}
        isPickup={mapView?.isPickup}
      />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Pesanan</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Pantau dan kelola seluruh transaksi pesanan platform Daurly.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari ID, Pelanggan, Toko, atau Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#D5CFC9] rounded-lg bg-white text-xs font-body focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition text-[#1F1B18]"
          />
        </div>
      </header>

      {!adminService.isConfigured() && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <AlertCircle size={18} />
          Supabase belum dikonfigurasi. Set environment variable Supabase di .env.local.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {needPickupCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
          <Store size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{needPickupCount} pesanan pickup menunggu konfirmasi</p>
            <p className="text-xs mt-0.5 text-amber-800">
              Setelah pelanggan bayar & ambil barang di toko, klik &quot;Konfirmasi Diambil&quot;.
            </p>
          </div>
        </div>
      )}

      {needChatCount > 0 && (
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-sm text-indigo-900">
          <MessageCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{needChatCount} pesanan QRIS menunggu chat pengiriman</p>
            <p className="text-xs mt-0.5 text-indigo-700">
              Alamat pengiriman pembeli tampil di kolom &quot;Alamat&quot;. Gunakan chat untuk konfirmasi jadwal & kurir.
            </p>
            <Link href="/admin/chat?tab=shipping" className="inline-block mt-2 text-xs font-bold text-[#16A34A] hover:underline">
              Buka Pusat Chat Pengiriman →
            </Link>
          </div>
        </div>
      )}

      <section className="bg-white border border-[#EAE5E0] rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
                isSelected ? "bg-[#16A34A] text-white" : "text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
              }`}
            >
              <span>{tab}</span>
              {tab === "Perlu Dikirim" && needShippingCount > 0 && (
                <span
                  className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    isSelected ? "bg-white text-[#16A34A]" : "bg-[#16A34A] text-white"
                  }`}
                >
                  {needShippingCount}
                </span>
              )}
            </button>
          );
        })}
      </section>

      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-[#8E8680] text-sm font-semibold">
            <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data pesanan...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                  {["ID Pesanan", "Tanggal", "Toko Daur Ulang", "Pelanggan", "Produk", "Total", "Alamat", "Pembayaran", "Status"].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E0]">
                {filteredOrders.map((order) => (
                  <tr key={order.uuid} className="hover:bg-[#F5F3F0]/30 transition">
                    <td className="px-6 py-4 font-semibold text-sm text-[#1F1B18]">{order.id}</td>
                    <td className="px-6 py-4 text-xs text-[#8E8680] font-semibold">{order.date}</td>
                    <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{order.storeName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F5F3F0] flex items-center justify-center font-bold text-xs text-[#8E8680] border border-[#EAE5E0]">
                          {order.avatar}
                        </div>
                        <span className="font-semibold text-xs text-[#1F1B18]">{order.buyer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F5F3F0] rounded overflow-hidden border border-[#EAE5E0] flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.productImg}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/product-keramik.png";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#1F1B18] leading-tight max-w-[160px] truncate">
                            {order.productName}
                          </p>
                          <p className="text-[10px] text-[#8E8680] font-medium mt-0.5">{order.productDetail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-[#16A34A]">
                      Rp {order.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      {order.paymentKind === "pickup" ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMapView({
                              title: `Pickup — ${order.buyer}`,
                              addressText: order.shippingAddress,
                              lat: order.shipLat,
                              lng: order.shipLng,
                              isPickup: true,
                            })
                          }
                          className="flex gap-2 text-left group"
                        >
                          <MapPin size={14} className="text-[#16A34A] flex-shrink-0 mt-0.5 group-hover:scale-110 transition" />
                          <span className="text-[10px] text-[#16A34A] font-bold group-hover:underline">
                            Lihat lokasi toko
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setMapView({
                              title: `Alamat — ${order.buyer}`,
                              addressText: order.shippingAddress,
                              lat: order.shipLat,
                              lng: order.shipLng,
                              isPickup: false,
                            })
                          }
                          className="flex gap-2 text-left group w-full"
                        >
                          <MapPin size={14} className="text-[#16A34A] flex-shrink-0 mt-0.5 group-hover:scale-110 transition" />
                          <p className="text-[10px] text-[#5C5550] leading-snug whitespace-pre-line font-medium group-hover:text-[#16A34A]">
                            {order.shippingAddress}
                          </p>
                          <span className="text-[9px] font-bold text-[#16A34A] mt-0.5 block">Klik untuk lihat di peta →</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPaymentBadgeClass(order.paymentKind)}`}
                      >
                        {order.paymentLabel}
                      </span>
                      <p className="text-[10px] text-[#8E8680] mt-1 max-w-[140px] leading-snug">
                        {order.paymentDesc}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            order.status === "Perlu Dikirim"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : order.status === "Belum Bayar"
                                ? "bg-zinc-100 text-[#5C5550] border-zinc-200"
                                : order.status === "Dikirim"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : order.status === "Dibatalkan"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {order.status}
                        </span>
                        {order.needsShippingChat && (
                          <Link
                            href={`/admin/chat?tab=shipping&order=${order.uuid}`}
                            className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-indigo-700 transition"
                          >
                            <MessageCircle size={12} />
                            Chat Pembeli
                          </Link>
                        )}
                        {order.status === "Perlu Dikirim" && order.paymentKind === "digital" && (
                          <button
                            onClick={() => handleShipOrder(order.uuid)}
                            className="bg-[#16A34A] text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                          >
                            Kirim Barang
                          </button>
                        )}
                        {order.status === "Perlu Dikirim" && order.paymentKind === "pickup" && (
                          <button
                            type="button"
                            onClick={() => handleConfirmPickup(order.uuid, order.buyer)}
                            disabled={confirmingPickup === order.uuid}
                            className="flex items-center gap-1 bg-amber-600 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-amber-700 transition disabled:opacity-60"
                          >
                            <Store size={12} />
                            {confirmingPickup === order.uuid ? "Memproses..." : "Konfirmasi Diambil"}
                          </button>
                        )}
                        {order.status === "Belum Bayar" && order.paymentKind === "digital" && (
                          <button
                            onClick={() => handleConfirmDigitalPayment(order.uuid, order.buyer)}
                            disabled={confirmingPickup === order.uuid}
                            className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-green-700 transition flex items-center gap-1"
                          >
                            Konfirmasi Lunas
                          </button>
                        )}
                        {order.buktiBayar && (
                          <button
                            onClick={() => window.open(order.buktiBayar!)}
                            className="border border-[#D5CFC9] text-[#5C5550] text-[10px] font-bold px-3 py-1.5 rounded hover:bg-[#F5F3F0] transition flex items-center gap-1"
                            title="Buka bukti pembayaran di tab baru"
                          >
                            Lihat Bukti
                          </button>
                        )}
                        {order.status === "Dikirim" && order.paymentKind !== "pickup" && (
                          <button
                            onClick={() => handleCompleteOrder(order.uuid)}
                            className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-green-700 transition"
                          >
                            Tandai Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#8E8680] text-sm font-semibold">
                      {orders.length === 0
                        ? "Belum ada pesanan di database."
                        : "Tidak ada pesanan ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 bg-[#F5F3F0]/40 border-t border-[#EAE5E0] flex items-center justify-between text-xs font-semibold text-[#8E8680]">
          <p>{loading ? "Memuat..." : `Menampilkan ${filteredOrders.length} dari ${orders.length} pesanan`}</p>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 text-[#16A34A] hover:underline text-xs font-bold"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>
      </section>
    </div>
  );
}
