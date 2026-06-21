"use client";

import React, { useState } from "react";

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState("Semua");

  const orders = [
    {
      invoice: "INV/20231025/MP/351294",
      date: "25 Okt 2023",
      status: "Dikirim",
      itemTitle: "Kain Batik Tulis Motif Mega Mendung Premium",
      itemQty: 1,
      itemPrice: 850000,
      itemImg: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150&auto=format&fit=crop",
      courierInfo: "JNE Regular (Resi: JP123456789)",
      totalAmount: 865000,
    },
    {
      invoice: "INV/20231024/MP/350112",
      date: "24 Okt 2023",
      status: "Selesai",
      itemTitle: "Organizer Meja Kayu Jati Solid Minimalis",
      itemQty: 2,
      itemPrice: 125000,
      itemImg: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=150&auto=format&fit=crop",
      courierInfo: "Diterima pada 26 Okt 2023",
      totalAmount: 260000,
    },
    {
      invoice: "INV/20231023/MP/349880",
      date: "23 Okt 2023",
      status: "Dibatalkan",
      itemTitle: "Kopi Arabika Gayo Single Origin 500g",
      itemQty: 1,
      itemPrice: 145000,
      itemImg: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=150&auto=format&fit=crop",
      courierInfo: "Alasan: Stok produk habis",
      totalAmount: 160000,
    }
  ];

  const tabs = ["Semua", "Belum Bayar", "Dikirim", "Selesai", "Dibatalkan"];

  const filteredOrders = orders.filter(
    (o) => activeTab === "Semua" || o.status === activeTab
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pesanan Saya</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Pantau status transaksi dan pengiriman produk UMKM Anda.
        </p>
      </header>

      {/* Tabs */}
      <section className="bg-white border border-surface-container rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {tabs.map((tab) => (
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
          </button>
        ))}
      </section>

      {/* Orders List */}
      <section className="space-y-6">
        {filteredOrders.map((ord) => (
          <div key={ord.invoice} className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
            
            {/* Header info bar */}
            <div className="flex justify-between items-center text-xs font-semibold text-secondary border-b border-surface-container pb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-on-surface">{ord.invoice}</span>
                <span>|</span>
                <span>{ord.date}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                  ord.status === "Dikirim"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : ord.status === "Selesai"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {ord.status}
              </span>
            </div>

            {/* Inner details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-surface-container rounded overflow-hidden">
                  <img src={ord.itemImg} alt={ord.itemTitle} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm text-on-surface leading-tight">
                    {ord.itemTitle}
                  </h4>
                  <p className="text-[10px] text-secondary font-bold">
                    {ord.itemQty} x Rp {ord.itemPrice.toLocaleString("id-ID")}
                  </p>
                  <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${ord.status === "Dibatalkan" ? "text-error" : "text-secondary"}`}>
                    <span className="material-symbols-outlined text-xs">
                      {ord.status === "Dibatalkan" ? "error" : "local_shipping"}
                    </span>
                    {ord.courierInfo}
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col justify-between md:items-end gap-3 text-right">
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Belanja</p>
                  <p className="font-headline font-extrabold text-base text-primary">
                    Rp {ord.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {ord.status === "Dikirim" && (
                    <button 
                      onClick={() => alert(`Lacak kurir untuk invoice: ${ord.invoice}`)}
                      className="px-4 py-2 border-2 border-on-surface hover:bg-surface-container text-on-surface font-bold text-xs rounded transition"
                    >
                      Lacak Pesanan
                    </button>
                  )}
                  {ord.status === "Selesai" && (
                    <>
                      <button 
                        onClick={() => alert(`Membuat pesanan baru untuk item: ${ord.itemTitle}`)}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
                      >
                        Beli Lagi
                      </button>
                      <button 
                        onClick={() => alert(`Membuka form ulasan untuk item: ${ord.itemTitle}`)}
                        className="px-4 py-2 border border-surface-container hover:bg-surface-container text-secondary font-bold text-xs rounded transition"
                      >
                        Beri Ulasan
                      </button>
                    </>
                  )}
                  {ord.status === "Dibatalkan" && (
                    <button 
                      onClick={() => alert(`Menampilkan rincian pembatalan untuk invoice: ${ord.invoice}`)}
                      className="px-4 py-2 border border-surface-container hover:bg-surface-container text-secondary font-bold text-xs rounded transition"
                    >
                      Lihat Detail
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="bg-white border border-surface-container p-12 rounded-xl text-center text-secondary text-sm shadow-sm">
            Tidak ada transaksi di status ini.
          </div>
        )}
      </section>
    </div>
  );
}
