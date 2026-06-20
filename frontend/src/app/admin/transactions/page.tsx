"use client";

import React, { useState, useEffect } from "react";

interface Transaction {
  id: string;
  date: string;
  buyer: string;
  email: string;
  avatar: string;
  amount: number;
  status: "pending" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
}

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Simulation loading data from Backend / DB
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mocking empty state initially
      setTransactions([]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  /* 
    ==========================================================================
    BACKEND INTEGRATION GUIDE (SUPABASE)
    ==========================================================================
    Untuk menyambungkan tabel "order" dari database Supabase, gunakan query berikut:

    import { createClient } from "@supabase/supabase-js";
    const supabase = createClient("SUPABASE_URL", "SUPABASE_ANON_KEY");

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        // Mengambil data order, join dengan table users untuk info pembeli
        const { data, error } = await supabase
          .from("order")
          .select(`
            id_order,
            created_at,
            total_hrg,
            stat_order,
            users (
              nama_lengkap,
              email
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transformasi format data ke state frontend
        const formatted: Transaction[] = (data || []).map((item: any) => ({
          id: item.id_order,
          date: new Date(item.created_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          buyer: item.users?.nama_lengkap || "Tanpa Nama",
          email: item.users?.email || "no-email@example.com",
          amount: Number(item.total_hrg),
          status: item.stat_order, // 'pending' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan'
          avatar: (item.users?.nama_lengkap || "UN")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
        }));

        setTransactions(formatted);
      } catch (err) {
        console.error("Gagal mengambil riwayat transaksi:", err);
      } finally {
        setIsLoading(false);
      }
    };
  */

  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute metrics dynamically from state
  const totalVolume = transactions
    .filter(t => t.status === "selesai")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactionsCount = transactions.length;

  const pendingPaymentsCount = transactions.filter(
    (t) => t.status === "pending"
  ).length;

  // Helper to map DB Order Status to UI text and color classes
  const getStatusBadgeStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "selesai":
        return {
          label: "Selesai",
          badge: "bg-green-50 text-green-700 border border-green-200",
          dot: "bg-green-600"
        };
      case "pending":
        return {
          label: "Pending",
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          dot: "bg-amber-600"
        };
      case "diproses":
        return {
          label: "Diproses",
          badge: "bg-blue-50 text-blue-700 border border-blue-200",
          dot: "bg-blue-600"
        };
      case "dikirim":
        return {
          label: "Dikirim",
          badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
          dot: "bg-indigo-600"
        };
      case "dibatalkan":
      default:
        return {
          label: "Dibatalkan",
          badge: "bg-red-50 text-red-700 border border-red-200",
          dot: "bg-red-600"
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Transaksi</h2>
          <p className="font-body text-body-md text-[#3E3834] mt-1">
            Kelola dan pantau semua aliran transaksi UMKM secara real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F5F3F0] text-[#3E3834] font-semibold text-sm rounded-lg hover:bg-[#EBE8E4] transition">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <button 
            onClick={() => alert("Mengunduh laporan transaksi...")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Unduh Laporan
          </button>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Total Volume</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-primary">
              Rp {totalVolume.toLocaleString("id-ID")}
            </h3>
            <p className="text-xs text-[#3E3834] font-semibold">
              Akumulasi transaksi berhasil
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">payments</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Total Transaksi</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
              {totalTransactionsCount}
            </h3>
            <p className="text-xs text-[#3E3834] font-semibold">
              Jumlah pesanan terdaftar
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">shopping_cart</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Pending Orders</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-error">
              {pendingPaymentsCount}
            </h3>
            <p className="text-xs text-[#3E3834] font-semibold">
              Menunggu proses verifikasi/pembayaran
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">pending_actions</span>
          </div>
        </div>
      </section>

      {/* Detailed Transaction Table */}
      <section className="bg-white rounded-xl overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-container-low/40">
          <h4 className="font-headline font-bold text-lg text-on-surface">Riwayat Transaksi</h4>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3E3834] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari Order ID atau Pembeli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#D5CFC9] rounded-lg bg-white text-xs font-body w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-[#F5F3F0] text-[#1F1B18]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Pembeli</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Total Harga</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0]">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-2/3"></div></td>
                    <td className="px-6 py-6"><div className="h-3 bg-[#F5F3F0] rounded w-1/2"></div></td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F5F3F0]"></div>
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-[#F5F3F0] rounded w-3/4"></div>
                          <div className="h-2 bg-[#F5F3F0] rounded w-1/2"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-1/3"></div></td>
                    <td className="px-6 py-6"><div className="h-5 bg-[#F5F3F0] rounded-full w-20"></div></td>
                    <td className="px-6 py-6"><div className="w-6 h-6 rounded bg-[#F5F3F0] mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                // Beautiful Empty State
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#3E3834]">receipt_long</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Data Transaksi</h5>
                      <p className="text-xs text-[#3E3834] max-w-sm">
                        Saat ini database transaksi kosong. Data akan terisi otomatis setelah pembeli menyelesaikan checkout.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const statusStyle = getStatusBadgeStyle(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/30 transition">
                      <td className="px-6 py-4 font-semibold text-sm text-on-surface">{t.id}</td>
                      <td className="px-6 py-4 text-xs text-[#3E3834]">{t.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-primary font-bold text-xs">
                            {t.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-on-surface leading-tight">{t.buyer}</span>
                            <span className="text-[10px] text-[#3E3834]">{t.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-primary">Rp {t.amount.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${statusStyle.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => alert(`Aksi detail untuk transaksi ${t.id}`)}
                          className="text-secondary hover:text-primary transition"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white flex justify-between items-center text-xs font-semibold text-[#3E3834]">
          <p>
            {isLoading
              ? "Memuat data..."
              : `Menampilkan ${filteredTransactions.length} dari ${transactions.length} transaksi`}
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] transition text-sm text-[#3E3834]" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] transition text-sm text-[#3E3834]">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] transition text-sm text-[#3E3834]">3</button>
            <span className="px-2 self-center">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] transition text-sm text-[#3E3834]">165</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] transition text-[#3E3834]">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
