"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/backend/adminService";

interface Transaction {
  id: string;
  date: string;
  buyer: string;
  email: string;
  avatar: string;
  amount: number;
  status: "pending" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  storeName: string;
  createdRaw: string;
}

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewDetails = async (id: string) => {
    setActiveDetailId(id);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const data = await adminService.getTransactionDetails(id);
      setDetailData(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat detail transaksi.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDownloadReport = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data transaksi untuk diunduh.");
      return;
    }

    const headers = ["Order ID", "Tanggal", "Toko", "Pembeli", "Email", "Total Harga", "Status"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.storeName,
      t.buyer,
      t.email,
      t.amount,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulation loading data from Backend / DB
  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      const data = await adminService.getTransactions();
      setTransactions(
        data.map((t) => ({
          ...t,
          status: t.status as Transaction["status"],
        }))
      );
      setIsLoading(false);
    }
    fetchTransactions();
  }, []);

  const storeNames = Array.from(new Set(transactions.map((t) => t.storeName).filter(Boolean)));

  const filteredTransactions = transactions.filter((t) => {
    // 1. Search Term Filter
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Store Filter
    const matchesStore =
      selectedStoreFilter === "all" || t.storeName === selectedStoreFilter;

    // 3. Date Filter
    let matchesDate = true;
    if (selectedDateFilter !== "all" && t.createdRaw) {
      const txDate = new Date(t.createdRaw);
      const now = new Date();
      if (selectedDateFilter === "today") {
        matchesDate =
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear();
      } else if (selectedDateFilter === "7days") {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchesDate = diffDays <= 7;
      } else if (selectedDateFilter === "30days") {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStore && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDateFilter, selectedStoreFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push("...");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    return pages;
  };

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
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Tanggal */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F3F0] text-[#3E3834] font-semibold text-xs rounded-lg border border-[#D5CFC9] focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer"
          >
            <option value="all">Semua Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
          </select>

          {/* Dropdown Toko */}
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F3F0] text-[#3E3834] font-semibold text-xs rounded-lg border border-[#D5CFC9] focus:outline-none focus:ring-2 focus:ring-primary transition cursor-pointer max-w-[200px]"
          >
            <option value="all">Semua Toko</option>
            {storeNames.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>

          <button 
            onClick={handleDownloadReport}
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
                paginatedTransactions.map((t) => {
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
                          onClick={() => handleViewDetails(t.id)}
                          className="text-secondary hover:text-primary transition p-1 hover:bg-[#F5F3F0] rounded"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
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
              : `Menampilkan ${
                  filteredTransactions.length === 0 ? 0 : startIndex + 1
                }-${Math.min(startIndex + itemsPerPage, filteredTransactions.length)} dari ${
                  filteredTransactions.length
                } transaksi`}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm text-[#3E3834]"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span key={idx} className="px-2 self-center text-[#8E8680]">
                    ...
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(Number(page))}
                  className={`w-8 h-8 flex items-center justify-center rounded transition text-sm ${
                    isCurrent
                      ? "bg-primary text-white font-bold"
                      : "bg-[#F5F3F0] hover:bg-[#EBE8E4] text-[#3E3834]"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] disabled:opacity-50 disabled:cursor-not-allowed transition text-[#3E3834]"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {activeDetailId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-left">
            <div className="px-6 py-4 border-b border-[#EAE5E0] flex justify-between items-center bg-[#FCFCFA] sticky top-0 z-10">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Detail Transaksi</h3>
                <p className="text-[10px] text-[#8E8680] font-semibold mt-0.5">ID: {activeDetailId}</p>
              </div>
              <button
                onClick={() => {
                  setActiveDetailId(null);
                  setDetailData(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F5F3F0] transition text-[#8E8680]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {loadingDetail ? (
                <div className="py-12 text-center text-[#8E8680] text-xs font-semibold">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat rincian transaksi...
                </div>
              ) : !detailData ? (
                <div className="py-12 text-center text-error text-xs font-semibold">
                  Gagal memuat rincian data.
                </div>
              ) : (
                <div className="space-y-6 text-xs text-[#3E3834] font-medium">
                  {/* Grid Status & Pembayaran */}
                  <div className="grid grid-cols-2 gap-4 bg-[#FCFCFA] p-4 rounded-xl border border-[#EAE5E0]">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#8E8680]">Status Order</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeStyle(detailData.stat_order).badge}`}>
                        {getStatusBadgeStyle(detailData.stat_order).label}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#8E8680]">Metode Pembayaran</p>
                      <p className="text-sm font-bold text-on-surface mt-1 capitalize">
                        {(detailData.tipe_pembayaran || "digital").replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {/* Grid Toko & Pembeli */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-[#EAE5E0] p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider border-b border-[#F5F3F0] pb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">storefront</span> Informasi Toko
                      </p>
                      <p className="font-bold text-sm text-on-surface">{detailData.seller?.nm_store || "Toko UMKM"}</p>
                      <p className="text-[#8E8680]">{detailData.seller?.email || "-"}</p>
                      <p className="text-[#8E8680]">{detailData.seller?.no_telp || "-"}</p>
                    </div>

                    <div className="border border-[#EAE5E0] p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider border-b border-[#F5F3F0] pb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">person</span> Informasi Pembeli
                      </p>
                      <p className="font-bold text-sm text-on-surface">{detailData.users?.nama_lengkap || "Tanpa Nama"}</p>
                      <p className="text-[#8E8680]">{detailData.users?.email || "-"}</p>
                      <p className="text-[#8E8680]">{detailData.users?.no_telp || "-"}</p>
                    </div>
                  </div>

                  {/* Alamat Pengiriman */}
                  {detailData.alamat && (
                    <div className="border border-[#EAE5E0] p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider border-b border-[#F5F3F0] pb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span> Alamat Pengiriman
                      </p>
                      <p className="font-bold text-on-surface">
                        {detailData.alamat.nama_penerima} ({detailData.alamat.label || "Rumah"})
                      </p>
                      <p className="text-[#8E8680] font-semibold">{detailData.alamat.no_telp}</p>
                      <p className="text-[#5C5550] leading-relaxed mt-1">
                        {detailData.alamat.detail_alamat}, Kec. {detailData.alamat.kecamatan}, {detailData.alamat.kota}, {detailData.alamat.provinsi} - {detailData.alamat.kode_pos}
                      </p>
                    </div>
                  )}

                  {/* Produk Yang Dibeli */}
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Produk Yang Dibeli</p>
                    <div className="divide-y divide-[#F5F3F0] border border-[#EAE5E0] rounded-xl overflow-hidden bg-white">
                      {(detailData.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex gap-3 hover:bg-[#FCFCFA] transition">
                          <div className="w-12 h-12 rounded bg-[#F5F3F0] overflow-hidden border border-[#EAE5E0] flex-shrink-0">
                            <img
                              src={item.img_snapshot || "/product-keramik.png"}
                              alt={item.nama_produk_snapshot}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-on-surface truncate leading-snug">{item.nama_produk_snapshot}</p>
                            <p className="text-[10px] text-[#8E8680] mt-0.5">
                              {item.qty_orderitem} barang x Rp {Number(item.hrg_saat_beli).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-primary">
                              Rp {(item.qty_orderitem * Number(item.hrg_saat_beli)).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan Pembeli */}
                  {detailData.catatan && (
                    <div className="bg-[#FCFCFA] p-3 rounded-lg border border-[#EAE5E0]">
                      <p className="text-[9px] uppercase font-bold text-[#8E8680]">Catatan Pembeli</p>
                      <p className="mt-0.5 leading-relaxed text-[#5C5550] italic font-semibold">
                        &quot;{detailData.catatan}&quot;
                      </p>
                    </div>
                  )}

                  {/* Rincian Pembayaran */}
                  <div className="border border-[#EAE5E0] rounded-xl p-4 bg-[#FCFCFA] space-y-2">
                    <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider border-b border-[#F5F3F0] pb-1.5">
                      Rincian Biaya
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8680]">Subtotal Produk</span>
                      <span className="font-semibold text-on-surface">
                        Rp {((detailData.items || []).reduce((sum: number, it: any) => sum + it.qty_orderitem * Number(it.hrg_saat_beli), 0)).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8680]">Ongkos Kirim</span>
                      <span className="font-semibold text-on-surface">
                        Rp {Number(detailData.ongkir || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8680]">Biaya Layanan</span>
                      <span className="font-semibold text-on-surface">
                        Rp {Number(detailData.biaya_layanan || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {Number(detailData.diskon || 0) > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Diskon Voucher</span>
                        <span className="font-semibold">
                          -Rp {Number(detailData.diskon).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-[#EAE5E0] pt-2 mt-2">
                      <span className="font-bold text-sm text-on-surface">Total Pembayaran</span>
                      <span className="font-extrabold text-sm text-primary">
                        Rp {Number(detailData.total_hrg).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[#EAE5E0] bg-[#FCFCFA] flex justify-end sticky bottom-0 z-10 rounded-b-xl">
              <button
                onClick={() => {
                  setActiveDetailId(null);
                  setDetailData(null);
                }}
                className="px-4 py-2 bg-[#1F1B18] text-white text-xs font-bold rounded-lg hover:opacity-90 transition shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
