"use client";

import React, { useState } from "react";

export default function SellerDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const needShippingCount = recentOrders.filter(
    (o) => o.status === "PERLU DIKIRIM" || o.status === "Perlu Dikirim"
  ).length;

  const packedCount = recentOrders.filter(
    (o) => o.status === "DIKEMAS" || o.status === "Dikemas"
  ).length;

  return (
    <div className="space-y-8">
      {/* 4 Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Perlu Dikirim */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Perlu Dikirim</p>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">{needShippingCount}</h3>
            </div>
          </div>
          {needShippingCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#1D4ED8] font-semibold bg-[#EFF6FF] px-2 py-1 rounded">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>+{needShippingCount} baru</span>
            </div>
          )}
        </div>

        {/* Card 2: Dikemas */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Dikemas</p>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">{packedCount}</h3>
            </div>
          </div>
          {packedCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#8E8680] font-semibold">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Aktif</span>
            </div>
          )}
        </div>

        {/* Card 3: Total Penjualan */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Total Penjualan</p>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">Rp 0</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#8E8680] font-bold">
            <span className="material-symbols-outlined text-sm">trending_flat</span>
            <span>-</span>
          </div>
        </div>

        {/* Card 4: Rating Toko */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Rating Toko</p>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">0.0</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#8E8680] font-semibold">
            <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
            <span>0 Ulasan</span>
          </div>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-xl font-bold text-[#1F1B18]">Daftar Pesanan Terbaru</h3>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#EAE5E0] text-[#5C5550] font-semibold text-xs rounded hover:bg-[#F5F3F0] transition">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#EAE5E0] text-[#5C5550] font-semibold text-xs rounded hover:bg-[#F5F3F0] transition">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#EAE5E0] rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0] text-[#8E8680] font-bold text-xs uppercase">
                <th className="px-6 py-4">No. Pesanan</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0] text-[#1F1B18] font-medium">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F3F0]/20 transition text-sm">
                    <td className="px-6 py-5 font-bold text-[#1F1B18]">{order.id}</td>
                    <td className="px-6 py-5">{order.customer}</td>
                    <td className="px-6 py-5 text-xs text-[#5C5550]">{order.product}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded text-[10px] font-extrabold tracking-wider ${
                        order.status === "PERLU DIKIRIM"
                          ? "bg-[#EFF6FF] text-[#1D4ED8]"
                          : "bg-[#F5F3F0] text-[#5C5550]"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-[#1F1B18]">{order.value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#8E8680] text-xs font-semibold">
                    Tidak ada pesanan terbaru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
