"use client";

import React, { useState, useEffect } from "react";

interface ReportChartData {
  label: string;
  height: string;
  revenue: string;
}

interface TopStoreData {
  nama: string;
  lokasi: string;
  kategori: string;
  pesanan: string;
  omzet: number;
  rating: number;
  status: string;
  logo: string;
}

interface ReportStats {
  totalRevenue: number;
  activeSellers: number;
  totalOrders: number;
  customerRating: number;
}

export default function AdminReportsPage() {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    activeSellers: 0,
    totalOrders: 0,
    customerRating: 0.0
  });
  const [chartData, setChartData] = useState<ReportChartData[]>([]);
  const [topStores, setTopStores] = useState<TopStoreData[]>([]);

  // Simulation loading data from Backend / DB
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mocking empty state initially
      setStats({
        totalRevenue: 0,
        activeSellers: 0,
        totalOrders: 0,
        customerRating: 0.0
      });
      setChartData([]);
      setTopStores([]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  /* 
    ==========================================================================
    BACKEND INTEGRATION GUIDE (SUPABASE)
    ==========================================================================
    Untuk menyambungkan dengan Supabase (tabel order, seller, payment, review_toko), 
    gunakan panduan query berikut:

    import { createClient } from "@supabase/supabase-js";
    const supabase = createClient("SUPABASE_URL", "SUPABASE_ANON_KEY");

    const fetchReportData = async () => {
      try {
        setIsLoading(true);

        // 1. Total Pendapatan (Sum dari payment sukses)
        const { data: payData, error: err1 } = await supabase
          .from("payment")
          .select("juml_pay")
          .eq("stat_pay", "success");
        const totalRevenue = payData?.reduce((sum, item) => sum + Number(item.juml_pay), 0) || 0;

        // 2. UMKM Aktif (Sellers terverifikasi)
        const { count: activeCount, error: err2 } = await supabase
          .from("seller")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true);

        // 3. Total Transaksi Selesai
        const { count: ordersCount, error: err3 } = await supabase
          .from("order")
          .select("*", { count: "exact", head: true })
          .eq("stat_order", "selesai");

        // 4. Kepuasan Pelanggan (Rata-rata rating dari review_toko)
        const { data: reviewData, error: err4 } = await supabase
          .from("review_toko")
          .select("rating");
        const avgRating = reviewData && reviewData.length > 0 
          ? reviewData.reduce((sum, item) => sum + item.rating, 0) / reviewData.length
          : 0.0;

        if (err1 || err2 || err3 || err4) throw new Error("Gagal mengambil data laporan.");

        setStats({
          totalRevenue,
          activeSellers: activeCount || 0,
          totalOrders: ordersCount || 0,
          customerRating: Number(avgRating.toFixed(1))
        });

        // 5. Query UMKM Berprestasi (Top 4 berdasarkan omzet tertinggi)
        // Gabungkan seller dengan orders & review_toko
        // setTopStores(formattedTopStores);

      } catch (err) {
        console.error("Gagal memuat laporan analitik:", err);
      } finally {
        setIsLoading(false);
      }
    };
  */

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Laporan & Analitik</h2>
          <p className="font-body text-body-md text-[#3E3834] mt-1">
            Pantau performa ekosistem UMKM dan pertumbuhan pendapatan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm">
          <div className="flex items-center px-4 py-2 text-sm text-[#3E3834] font-semibold">
            <span className="material-symbols-outlined text-[#3E3834] mr-2">calendar_today</span>
            <span className="font-semibold text-on-surface">Periode Sekarang</span>
          </div>
          <button 
            onClick={() => alert("Mengekspor data analitik...")}
            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Data
          </button>
        </div>
      </header>

      {/* Analytics Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#3E3834]">
                <p className="text-xs uppercase font-bold tracking-wider">Total Pendapatan</p>
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-[#5A534E]">Akumulasi pembayaran sukses</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#3E3834]">
                <p className="text-xs uppercase font-bold tracking-wider">UMKM Aktif</p>
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                {stats.activeSellers}
              </h3>
              <p className="text-[10px] text-[#5A534E]">UMKM yang telah diverifikasi</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#3E3834]">
                <p className="text-xs uppercase font-bold tracking-wider">Total Transaksi</p>
                <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                {stats.totalOrders}
              </h3>
              <p className="text-[10px] text-[#5A534E]">Jumlah transaksi diselesaikan</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#3E3834]">
                <p className="text-xs uppercase font-bold tracking-wider">Kepuasan Pelanggan</p>
                <span className="material-symbols-outlined text-primary text-[20px]">star</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                {stats.customerRating > 0 ? `${stats.customerRating}/5.0` : "-"}
              </h3>
              <p className="text-[10px] text-[#5A534E]">Rata-rata ulasan rating toko</p>
            </>
          )}
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth (2/3 col) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">Pertumbuhan Pendapatan</h4>
            <p className="font-body text-xs text-[#3E3834]">Visualisasi performa harian periode ini</p>
          </div>
          
          <div className="h-64 w-full relative flex items-center justify-center rounded-lg bg-[#FCFCFA] px-4 pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[#5A534E]">insights</span>
                <p className="text-xs text-[#5A534E] font-medium">Memuat grafik pendapatan...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center p-8">
                <span className="material-symbols-outlined text-4xl text-[#5A534E]">chart_data</span>
                <h5 className="text-sm font-bold text-[#1F1B18]">Belum Ada Data Pertumbuhan</h5>
                <p className="text-xs text-[#5A534E] max-w-sm">
                  Grafik pendapatan harian akan terisi otomatis setelah terdapat data transaksi terekam.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-1 w-full h-full pb-6">
                {chartData.map((bar, i) => (
                  <div 
                    key={i} 
                    className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {hoveredBarIndex === i && (
                      <div className="absolute -top-6 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                        {bar.revenue}
                      </div>
                    )}
                    <div 
                      className={`w-full rounded-t-sm transition duration-200 ${hoveredBarIndex === i ? "bg-[#ff6f00] brightness-95" : "bg-[#ff6f00]/20 border-t-2 border-[#ff6f00]"}`}
                      style={{ height: bar.height }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution (1/3 col) */}
        <div className="bg-white p-6 rounded-xl space-y-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">Distribusi Kategori</h4>
            <p className="font-body text-xs text-[#3E3834]">Berdasarkan volume penjualan</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[160px] rounded-lg bg-[#FCFCFA] p-6">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[#5A534E]">pie_chart</span>
                <p className="text-xs text-[#5A534E] font-medium">Memuat distribusi...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-[#5A534E]">donut_large</span>
                <h5 className="text-sm font-bold text-[#1F1B18]">Belum Ada Data Kategori</h5>
                <p className="text-xs text-[#5A534E] max-w-[200px]">
                  Data penjualan kategori produk akan dikalkulasikan secara realtime.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Performing Stores Table */}
      <section className="bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="p-6 flex justify-between items-center bg-surface-container-low/40">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">UMKM Berprestasi</h4>
            <p className="font-body text-xs text-[#3E3834]">Peringkat berdasarkan omzet tertinggi bulan ini</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#F5F3F0] text-[#3E3834]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Toko UMKM</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Total Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Omzet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0]">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F5F3F0]"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-[#F5F3F0] rounded w-28"></div>
                          <div className="h-2 bg-[#F5F3F0] rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="h-3 bg-[#F5F3F0] rounded w-16"></div></td>
                    <td className="px-6 py-6"><div className="h-3 bg-[#F5F3F0] rounded w-10"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-8"></div></td>
                    <td className="px-6 py-6"><div className="h-5 bg-[#F5F3F0] rounded w-14"></div></td>
                  </tr>
                ))
              ) : topStores.length === 0 ? (
                // Beautiful Empty State
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#5A534E]">military_tech</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Toko Teratas</h5>
                      <p className="text-xs text-[#5A534E] max-w-sm">
                        Data omzet toko sedang dikalkulasi oleh sistem laporan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                topStores.map((store, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-high rounded overflow-hidden">
                          <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{store.nama}</p>
                          <p className="text-[10px] text-[#3E3834]">{store.lokasi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#3E3834] font-semibold">{store.kategori}</td>
                    <td className="px-6 py-4 text-xs text-on-surface font-semibold">{store.pesanan}</td>
                    <td className="px-6 py-4 font-bold text-sm text-primary">Rp {store.omzet.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold text-on-surface">{store.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${store.status === "Verified" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                        {store.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
