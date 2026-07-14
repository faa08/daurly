"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/backend/adminService";

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

const MOCK_CHART_DATA: ReportChartData[] = [
  { label: "Senin", height: "30%", revenue: "Rp 1.200.000" },
  { label: "Selasa", height: "60%", revenue: "Rp 2.400.000" },
  { label: "Rabu", height: "45%", revenue: "Rp 1.800.000" },
  { label: "Kamis", height: "75%", revenue: "Rp 3.100.000" },
  { label: "Jumat", height: "90%", revenue: "Rp 4.200.000" },
  { label: "Sabtu", height: "100%", revenue: "Rp 5.500.000" },
  { label: "Minggu", height: "80%", revenue: "Rp 4.800.000" }
];

const MOCK_TOP_STORES: TopStoreData[] = [
  {
    nama: "Batik Kawung Jaya",
    lokasi: "Yogyakarta",
    kategori: "Fashion Pria",
    pesanan: "12",
    omzet: 4104000,
    rating: 4.9,
    status: "Aktif",
    logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop"
  },
  {
    nama: "Mitra Rotan Abadi",
    lokasi: "Cirebon",
    kategori: "Aksesoris",
    pesanan: "6",
    omzet: 2208000,
    rating: 4.8,
    status: "Aktif",
    logo: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=100&auto=format&fit=crop"
  },
  {
    nama: "Cokelat Nusantara",
    lokasi: "Blitar",
    kategori: "Kuliner",
    pesanan: "3",
    omzet: 382000,
    rating: 4.7,
    status: "Aktif",
    logo: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=100&auto=format&fit=crop"
  }
];

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

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      const [statsData, chart, stores] = await Promise.all([
        adminService.getReportStats(),
        adminService.getWeeklyRevenueChart(),
        adminService.getTopStores(5),
      ]);
      setStats(statsData);
      const maxAmount = Math.max(...chart.map((c) => c.amount), 1);
      setChartData(
        chart.map((c) => ({
          label: c.label,
          height: `${Math.round((c.amount / maxAmount) * 100)}%`,
          revenue: `Rp ${c.amount.toLocaleString("id-ID")}`,
        }))
      );
      setTopStores(
        stores.map((s) => ({
          ...s,
          pesanan: String(s.pesanan),
        }))
      );
      setIsLoading(false);
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Laporan & Analitik</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Pantau performa ekosistem Daur Ulang dan pertumbuhan pendapatan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-[#EAE5E0]">
          <div className="flex items-center px-4 py-2 text-xs text-[#5C5550] font-semibold">
            <span className="material-symbols-outlined text-[#8E8680] mr-2 text-[18px]">calendar_today</span>
            <span className="font-semibold text-[#1F1B18]">Periode Sekarang</span>
          </div>
          <button 
            onClick={() => alert("Mengekspor data analitik...")}
            className="px-4 py-2 bg-[#16A34A] text-white font-bold text-xs rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Data
          </button>
        </div>
      </header>

      {/* Analytics Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#EAE5E0] space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#5C5550]">
                <p className="text-xs uppercase font-bold tracking-wider">Total Pendapatan</p>
                <span className="material-symbols-outlined text-[#16A34A] text-[20px]">payments</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-[#8E8680]">Akumulasi pembayaran sukses</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE5E0] space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#5C5550]">
                <p className="text-xs uppercase font-bold tracking-wider">Daur Ulang Aktif</p>
                <span className="material-symbols-outlined text-[#16A34A] text-[20px]">store</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">
                {stats.activeSellers}
              </h3>
              <p className="text-[10px] text-[#8E8680]">Daur Ulang terdaftar & terhubung</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE5E0] space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#5C5550]">
                <p className="text-xs uppercase font-bold tracking-wider">Total Transaksi</p>
                <span className="material-symbols-outlined text-[#16A34A] text-[20px]">shopping_cart</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">
                {stats.totalOrders}
              </h3>
              <p className="text-[10px] text-[#8E8680]">Jumlah transaksi platform selesai</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE5E0] space-y-2 hover:shadow-md transition shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-6 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start text-[#5C5550]">
                <p className="text-xs uppercase font-bold tracking-wider">Kepuasan Pelanggan</p>
                <span className="material-symbols-outlined text-[#16A34A] text-[20px]">star</span>
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">
                {stats.customerRating > 0 ? `${stats.customerRating}/5.0` : "-"}
              </h3>
              <p className="text-[10px] text-[#8E8680]">Rata-rata ulasan rating toko</p>
            </>
          )}
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth (2/3 col) */}
        <div className="lg:col-span-2 bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <h4 className="font-headline font-bold text-lg text-[#1F1B18]">Pertumbuhan Pendapatan</h4>
            <p className="font-body text-xs text-[#5C5550]">Visualisasi performa harian periode ini</p>
          </div>
          
          <div className="h-64 w-full relative flex items-center justify-center rounded-lg bg-[#FCFCFA] px-4 pt-6 border border-[#EAE5E0]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[#8E8680]">insights</span>
                <p className="text-xs text-[#8E8680] font-medium">Memuat grafik pendapatan...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center p-8">
                <span className="material-symbols-outlined text-4xl text-[#8E8680]">chart_data</span>
                <h5 className="text-sm font-bold text-[#1F1B18]">Belum Ada Data Pertumbuhan</h5>
                <p className="text-xs text-[#8E8680] max-w-sm">
                  Grafik pendapatan harian akan terisi otomatis setelah terdapat data transaksi terekam.
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-3 w-full h-full pb-6 justify-around">
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
                      className={`w-full rounded-t-sm transition duration-200 ${hoveredBarIndex === i ? "bg-[#16A34A] brightness-95" : "bg-[#16A34A]/20 border-t-2 border-[#16A34A]"}`}
                      style={{ height: bar.height }}
                    ></div>
                    <span className="absolute -bottom-5 text-[10px] text-[#8E8680] font-bold mt-1">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution (1/3 col) */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            <h4 className="font-headline font-bold text-lg text-[#1F1B18]">Distribusi Kategori</h4>
            <p className="font-body text-xs text-[#5C5550]">Berdasarkan volume penjualan</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[160px] rounded-lg bg-[#FCFCFA] p-6 border border-[#EAE5E0]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[#8E8680]">pie_chart</span>
                <p className="text-xs text-[#8E8680] font-medium">Memuat distribusi...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-[#8E8680]">donut_large</span>
                <h5 className="text-sm font-bold text-[#1F1B18]">Data Penjualan Kategori</h5>
                <div className="space-y-1.5 text-xs text-[#5C5550] text-left mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full" />
                    <span>Fashion Pria (65%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                    <span>Aksesoris (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span>Kuliner (10%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Performing Stores Table */}
      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="p-6 flex justify-between items-center bg-[#F5F3F0]/40 border-b border-[#EAE5E0]">
          <div>
            <h4 className="font-headline font-bold text-lg text-[#1F1B18]">Daur Ulang Berprestasi</h4>
            <p className="font-body text-xs text-[#5C5550]">Peringkat berdasarkan omzet tertinggi bulan ini</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0] text-[#5C5550]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Toko Daur Ulang</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kategori Utama</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Total Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Omzet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0]">
              {isLoading ? (
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
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#8E8680]">military_tech</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Toko Teratas</h5>
                      <p className="text-xs text-[#8E8680] max-w-sm">
                        Data omzet toko sedang dikalkulasi oleh sistem laporan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                topStores.map((store, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F3F0]/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F5F3F0] border border-[#EAE5E0] rounded overflow-hidden flex-shrink-0">
                          <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1F1B18]">{store.nama}</p>
                          <p className="text-[10px] text-[#8E8680]">{store.lokasi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#5C5550] font-semibold">{store.kategori}</td>
                    <td className="px-6 py-4 text-xs text-[#1F1B18] font-semibold">{store.pesanan}</td>
                    <td className="px-6 py-4 font-bold text-sm text-[#16A34A]">Rp {store.omzet.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold text-[#1F1B18]">{store.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          store.status === "Aktif"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
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
