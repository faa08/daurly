"use client";

import React, { useState, useEffect } from "react";

interface DashboardStats {
  totalSellers: number;
  activeProducts: number;
  totalVolume: number;
  pendingVerifications: number;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0,
    activeProducts: 0,
    totalVolume: 0,
    pendingVerifications: 0,
  });
  const [chartData, setChartData] = useState<number[]>([]);

  // Simulation of loading data from Backend/Database
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mocking empty database initially
      // Once connected to DB, these values will come from fetch / Supabase queries
      setStats({
        totalSellers: 0,
        activeProducts: 0,
        totalVolume: 0,
        pendingVerifications: 0,
      });
      setChartData([]); // Empty chart data initially
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  /* 
    ==========================================================================
    BACKEND INTEGRATION GUIDE (SUPABASE)
    ==========================================================================
    Untuk menyambungkan dengan Supabase PostgreSQL, gunakan kode di bawah ini:
    
    import { createClient } from "@supabase/supabase-js";
    const supabase = createClient("SUPABASE_URL", "SUPABASE_ANON_KEY");

    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // 1. Total UMKM (Seller) Terdaftar
        const { count: sellersCount, error: err1 } = await supabase
          .from("seller")
          .select("*", { count: "exact", head: true });

        // 2. Total Produk Aktif (Tersedia)
        const { count: productsCount, error: err2 } = await supabase
          .from("produk")
          .select("*", { count: "exact", head: true })
          .eq("stat_produk", "tersedia");

        // 3. Total Volume Transaksi (dari tabel "order" dengan status "selesai")
        const { data: ordersData, error: err3 } = await supabase
          .from("order")
          .select("total_hrg")
          .eq("stat_order", "selesai");
        const totalVolume = ordersData?.reduce((sum, item) => sum + Number(item.total_hrg), 0) || 0;

        // 4. Antrian Verifikasi Toko (seller belum diverifikasi)
        const { count: pendingCount, error: err4 } = await supabase
          .from("seller")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", false);

        if (err1 || err2 || err3 || err4) {
          throw new Error("Gagal mengambil data dari database.");
        }

        setStats({
          totalSellers: sellersCount || 0,
          activeProducts: productsCount || 0,
          totalVolume: totalVolume,
          pendingVerifications: pendingCount || 0,
        });

        // 5. Mengambil Data Grafik (contoh agregasi volume per bulan)
        // logic tambahan untuk mengelompokkan total_hrg berdasarkan created_at bulan
        // setChartData([janVal, febVal, ...]);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  */

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Dashboard</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Ringkasan performa platform Pelataran UMKM hari ini.
        </p>
      </header>

      {/* 4 Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total UMKM Terdaftar */}
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          {isLoading ? (
            <div className="w-full space-y-3 animate-pulse">
              <div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-8 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Total UMKM</p>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">
                    {stats.totalSellers.toLocaleString("id-ID")}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Produk Aktif */}
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          {isLoading ? (
            <div className="w-full space-y-3 animate-pulse">
              <div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-8 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#F5F3F0] flex items-center justify-center text-[#3E3834] flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Produk Aktif</p>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">
                    {stats.activeProducts.toLocaleString("id-ID")}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Total Transaksi */}
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          {isLoading ? (
            <div className="w-full space-y-3 animate-pulse">
              <div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-8 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#F5F3F0] flex items-center justify-center text-[#3E3834] flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Total Volume</p>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">
                    Rp {stats.totalVolume.toLocaleString("id-ID")}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Antrian Verifikasi */}
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          {isLoading ? (
            <div className="w-full space-y-3 animate-pulse">
              <div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div>
              <div className="h-8 bg-[#F5F3F0] rounded w-1/2"></div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#3E3834] tracking-wider">Antrian Verifikasi</p>
                <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">
                  {stats.pendingVerifications} Toko
                </h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transaction Growth Chart Section */}
      <section className="bg-white rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#1F1B18]">Grafik Pertumbuhan Transaksi</h3>
            <p className="text-xs text-[#3E3834] mt-0.5">Data akumulasi transaksi UMKM periode ini</p>
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F5F3F0] text-[#3E3834] font-semibold text-xs rounded-lg hover:bg-[#EBE8E4] transition">
              <span>Bulanan</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>

        {/* Custom SVG Chart Area */}
        <div className="relative w-full h-[300px] flex items-center justify-center rounded-lg bg-[#FCFCFA]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3E3834]">insights</span>
              </div>
              <p className="text-xs text-[#3E3834] font-medium">Memuat data grafik...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-center p-8">
              <span className="material-symbols-outlined text-4xl text-[#3E3834]">analytics</span>
              <h4 className="text-sm font-bold text-[#1F1B18]">Belum Ada Data Transaksi</h4>
              <p className="text-xs text-[#3E3834] max-w-sm">
                Grafik performa transaksi akan otomatis terisi setelah terdapat transaksi berhasil yang tercatat di database.
              </p>
            </div>
          ) : (
            <svg className="w-full h-full p-4" viewBox="0 0 800 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="50" x2="800" y2="50" stroke="#F5F3F0" strokeWidth="1" />
              <line x1="0" y1="110" x2="800" y2="110" stroke="#F5F3F0" strokeWidth="1" />
              <line x1="0" y1="170" x2="800" y2="170" stroke="#F5F3F0" strokeWidth="1" />
              <line x1="0" y1="230" x2="800" y2="230" stroke="#F5F3F0" strokeWidth="1" />
              <line x1="0" y1="290" x2="800" y2="290" stroke="#F5F3F0" strokeWidth="1" />

              {/* Dynamic Path generation could go here based on chartData */}
              {/* For demo, fallback flat line or render points if exists */}
            </svg>
          )}
        </div>
      </section>
    </div>
  );
}

