"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Package, Truck, CheckCircle2, X, MapPin, AlertCircle, MessageCircle, Store } from "lucide-react";
import Link from "next/link";
import { adminService, type AdminShipmentOrder, type AdminShipStatus } from "@/backend/adminService";
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

const COURIERS = ["JNE", "J&T Express", "SiCepat", "Gosend"];

export default function AdminPengirimanPage() {
  const [orders, setOrders] = useState<AdminShipmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminShipStatus>("Perlu Dikirim");
  const [modalOrder, setModalOrder] = useState<AdminShipmentOrder | null>(null);
  const [mapView, setMapView] = useState<MapViewState>(null);
  const [courier, setCourier] = useState("JNE");
  const [resi, setResi] = useState("");
  const [eta, setEta] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmingPickup, setConfirmingPickup] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getShipments();
      setOrders(data);
    } catch {
      setError("Gagal memuat data pengiriman dari database.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function openModal(order: AdminShipmentOrder) {
    setModalOrder(order);
    setCourier("JNE");
    setResi("");
    setEta("");
  }

  async function submitResi(e: React.FormEvent) {
    e.preventDefault();
    if (!modalOrder) return;
    setSubmitting(true);
    try {
      const saved = await shippingService.createShipment(modalOrder.uuid, courier, resi, eta);
      if (!saved) throw new Error("Gagal simpan pengiriman");

      const updated = await adminService.updateOrderStatus(modalOrder.uuid, "dikirim");
      if (!updated) throw new Error("Gagal update status order");

      setModalOrder(null);
      setActiveTab("Sedang Dikirim");
      await fetchOrders();
    } catch {
      alert("Gagal menyimpan resi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmPickup(order: AdminShipmentOrder) {
    const ok = window.confirm(
      `Konfirmasi pesanan pickup dari ${order.buyer} sudah diambil & dibayar di toko?`
    );
    if (!ok) return;

    setConfirmingPickup(order.uuid);
    const result = await adminService.confirmPickupOrder(order.uuid);
    setConfirmingPickup(null);

    if (result.ok) {
      await fetchOrders();
    } else {
      alert(result.error || "Gagal mengonfirmasi pickup.");
    }
  }

  const tabs: AdminShipStatus[] = ["Perlu Dikirim", "Sedang Dikirim", "Selesai"];
  const filtered = orders.filter((o) => o.status === activeTab);
  const tabCounts = {
    "Perlu Dikirim": orders.filter((o) => o.status === "Perlu Dikirim").length,
    "Sedang Dikirim": orders.filter((o) => o.status === "Sedang Dikirim").length,
    Selesai: orders.filter((o) => o.status === "Selesai").length,
  };

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
      <header className="flex items-end justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Pengiriman</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Input resi dan pantau status pengiriman pesanan dari seluruh toko mitra.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 text-[#16A34A] text-xs font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
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

      <div className="bg-white border border-[#EAE5E0] rounded-lg p-1 flex gap-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === tab ? "bg-[#16A34A] text-white" : "text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
            }`}
          >
            {tab === "Perlu Dikirim" && <Package size={13} />}
            {tab === "Sedang Dikirim" && <Truck size={13} />}
            {tab === "Selesai" && <CheckCircle2 size={13} />}
            {tab}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeTab === tab ? "bg-white/20 text-white" : "bg-[#F5F3F0] text-[#5C5550]"
              }`}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {loading ? (
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-12 text-center">
            <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#8E8680] font-semibold">Memuat data pengiriman...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-12 text-center text-[#8E8680] text-sm font-semibold shadow-sm">
            {orders.length === 0
              ? "Belum ada data pengiriman di database."
              : "Tidak ada pesanan di status ini."}
          </div>
        ) : (
          filtered.map((order) => (
            <div key={order.uuid} className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#8E8680]">
                    <span className="font-bold text-[#1F1B18]">{order.id}</span>
                    <span>•</span>
                    <span>{order.date}</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPaymentBadgeClass(order.paymentKind)}`}
                    >
                      {order.paymentLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8E8680]">{order.paymentDesc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">
                        Toko Mitra
                      </p>
                      <p className="font-bold text-sm text-[#1F1B18]">{order.storeName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">
                        Pembeli
                      </p>
                      <p className="font-bold text-sm text-[#1F1B18]">{order.buyer}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">
                        Produk
                      </p>
                      <p className="text-sm text-[#1F1B18] font-medium">
                        {order.product} <span className="text-[#8E8680]">× {order.qty}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMapView({
                        title: `Alamat — ${order.buyer}`,
                        addressText: order.address,
                        lat: order.shipLat,
                        lng: order.shipLng,
                        isPickup: order.paymentKind === "pickup",
                      })
                    }
                    className="flex items-start gap-2 text-left w-full group"
                  >
                    <MapPin size={13} className="text-[#16A34A] mt-0.5 flex-shrink-0 group-hover:scale-110 transition" />
                    <p className="text-xs text-[#5C5550] leading-relaxed group-hover:text-[#16A34A]">
                      {order.address}
                      <span className="block text-[10px] font-bold text-[#16A34A] mt-1">Klik untuk lihat di peta →</span>
                    </p>
                  </button>
                  {order.status !== "Perlu Dikirim" && order.courier && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F5F3F0]">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                        {order.courier}
                      </span>
                      <span className="text-xs text-[#5C5550] font-semibold">Resi: {order.resi}</span>
                      {order.eta && (
                        <span className="text-xs text-[#8E8680]">• Est. tiba: {order.eta}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {order.status === "Perlu Dikirim" && order.paymentKind === "pickup" && (
                    <button
                      type="button"
                      onClick={() => handleConfirmPickup(order)}
                      disabled={confirmingPickup === order.uuid}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-700 transition disabled:opacity-60"
                    >
                      <Store size={14} />
                      {confirmingPickup === order.uuid ? "Memproses..." : "Konfirmasi Diambil"}
                    </button>
                  )}
                  {order.status === "Perlu Dikirim" && order.paymentKind === "digital" && (
                    <div className="flex flex-col gap-2 items-end">
                      <Link
                        href={`/admin/chat?tab=shipping&order=${order.uuid}`}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition"
                      >
                        <MessageCircle size={14} />
                        Chat Pembeli Dulu
                      </Link>
                      <button
                        onClick={() => openModal(order)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                      >
                        <Truck size={14} />
                        Input Resi
                      </button>
                    </div>
                  )}
                  {order.status === "Sedang Dikirim" && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <Truck size={13} />
                      Sedang Dikirim
                    </span>
                  )}
                  {order.status === "Selesai" && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {modalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOrder(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE5E0] bg-[#F5F3F0]/50">
              <h3 className="font-bold text-lg text-[#1F1B18]">Input Nomor Resi</h3>
              <button onClick={() => setModalOrder(null)} className="p-1 hover:bg-[#F5F3F0] rounded transition">
                <X size={18} className="text-[#8E8680]" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#F5F3F0]/60 rounded-lg p-4 mb-5 space-y-1">
                <p className="text-xs font-bold text-[#8E8680] uppercase tracking-wider">
                  {modalOrder.id} ({modalOrder.storeName})
                </p>
                <p className="text-sm font-semibold text-[#1F1B18]">
                  {modalOrder.product} × {modalOrder.qty}
                </p>
                <p className="text-xs text-[#5C5550] flex items-center gap-1.5">
                  <MapPin size={11} />
                  {modalOrder.address}
                </p>
              </div>
              <form onSubmit={submitResi} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">
                    Pilih Kurir
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COURIERS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCourier(c)}
                        className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                          courier === c
                            ? "border-[#16A34A] bg-blue-50 text-[#16A34A]"
                            : "border-[#EAE5E0] text-[#5C5550] hover:border-[#16A34A]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">
                    Nomor Resi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: JNE123456789"
                    value={resi}
                    onChange={(e) => setResi(e.target.value)}
                    required
                    className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#16A34A] transition bg-[#F5F3F0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">
                    Estimasi Tiba
                  </label>
                  <input
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    required
                    className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#16A34A] transition bg-[#F5F3F0]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#16A34A] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Truck size={16} />
                      Konfirmasi Pengiriman
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
