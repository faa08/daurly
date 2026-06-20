"use client";

import React, { useState } from "react";

export default function SellerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  
  const [orders, setOrders] = useState<any[]>([]);

  const tabs = ["Semua", "Belum Bayar", "Perlu Dikirim", "Dikirim", "Selesai", "Dibatalkan"];

  // Helper count for Perlu Dikirim tab badge
  const needShippingCount = orders.filter((o) => o.status === "Perlu Dikirim").length;

  const handleShipOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Dikirim" } : o))
    );
    alert(`Pesanan ${id} berhasil diproses dan diserahkan ke kurir!`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "Semua" || o.status === activeTab;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Pesanan Baru</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Kelola dan proses pesanan yang masuk ke toko Anda.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari ID Pesanan, Pelanggan, atau Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-surface-container-highest rounded-lg bg-white text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
      </header>

      {/* Filter Tabs */}
      <section className="bg-white border border-surface-container rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          const isShippingTab = tab === "Perlu Dikirim";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
                isSelected
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <span>{tab}</span>
              {isShippingTab && needShippingCount > 0 && (
                <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-primary" : "bg-primary text-white"}`}>
                  {needShippingCount}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Orders List Table */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">ID Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/30 transition">
                  <td className="px-6 py-4 font-semibold text-sm text-on-surface">{order.id}</td>
                  <td className="px-6 py-4 text-xs text-secondary font-semibold">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs text-secondary border border-zinc-200">
                        {order.avatar}
                      </div>
                      <span className="font-semibold text-xs text-on-surface">{order.buyer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-high rounded overflow-hidden">
                        <img src={order.productImg} alt={order.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-on-surface leading-tight">{order.productName}</p>
                        <p className="text-[10px] text-secondary font-medium mt-0.5">{order.productDetail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-primary">Rp {order.total.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          order.status === "Perlu Dikirim"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : order.status === "Belum Bayar"
                            ? "bg-zinc-100 text-secondary border-zinc-200"
                            : order.status === "Dikirim"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.status === "Perlu Dikirim" && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded hover:brightness-95 transition"
                        >
                          Kirim Barang
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/40 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-secondary">
          <p>
            {orders.length > 0
              ? `Menampilkan ${filteredOrders.length} dari ${orders.length} pesanan`
              : "Tidak ada pesanan"}
          </p>
          {orders.length > 0 && (
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">1</button>
              <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">2</button>
              <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">3</button>
              <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
