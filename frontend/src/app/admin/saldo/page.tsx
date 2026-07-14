"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wallet, Clock, ArrowDownCircle, TrendingUp, X, CheckCircle, AlertCircle } from "lucide-react";
import { adminService, type AdminSaldoTransaction } from "@/backend/adminService";

const BANKS = ["BCA", "BNI", "Mandiri", "BRI"];

function fmtRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function AdminSaldoPage() {
  const [transactions, setTransactions] = useState<AdminSaldoTransaction[]>([]);
  const [summary, setSummary] = useState({ totalAvailable: 0, totalPending: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [filterType, setFilterType] = useState("Semua");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txData, summaryData] = await Promise.all([
        adminService.getSaldoTransactions(),
        adminService.getSaldoSummary(),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
    } catch {
      setError("Gagal memuat data saldo dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const amount = Number(withdrawAmount);
    const bankInfo = `Penarikan ke ${selectedBank} ${accountNumber}`;
    const sellerId = await adminService.getFirstSellerId();

    if (!sellerId) {
      alert("Tidak ada data toko di database. Tambahkan seller terlebih dahulu.");
      setSubmitting(false);
      return;
    }

    const ok = await adminService.requestWithdrawal(sellerId, amount, bankInfo);
    setSubmitting(false);
    if (ok) {
      setWithdrawDone(true);
      fetchData();
    } else {
      alert("Gagal menyimpan permintaan pencairan.");
    }
  }

  function closeModal() {
    setShowModal(false);
    setWithdrawDone(false);
    setWithdrawAmount("");
    setAccountNumber("");
    setSelectedBank("BCA");
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "Masuk") return tx.type === "masuk";
    if (filterType === "Keluar") return tx.type === "keluar";
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Keuangan & Saldo Platform</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Pantau arus kas masuk, saldo pending, dan penarikan dana dari seluruh mitra daur ulang.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-[#16A34A] text-xs font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </header>

      {!adminService.isConfigured() && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <AlertCircle size={18} />
          Supabase belum dikonfigurasi. Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> di .env.local.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-xl p-6 shadow-lg flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-80">
              <Wallet size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Dana Tersedia</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">
              {loading ? "..." : fmtRp(summary.totalAvailable)}
            </p>
            <p className="text-xs opacity-70 font-medium">Saldo gabungan seluruh mitra daur ulang yang dapat ditarik</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-[#16A34A] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-md"
          >
            <ArrowDownCircle size={16} /> Cairkan Dana
          </button>
        </div>
        <div className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#5C5550]">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Dana Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-[#1F1B18]">
            {loading ? "..." : fmtRp(summary.totalPending)}
          </p>
          <p className="text-xs text-[#8E8680] font-medium leading-relaxed">
            Menunggu konfirmasi pengiriman selesai dari pembeli.
          </p>
          {summary.pendingCount > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              <TrendingUp size={13} className="text-green-600" />
              <span className="text-xs text-green-600 font-bold">
                {summary.pendingCount} transaksi platform pending
              </span>
            </div>
          )}
        </div>
      </div>

      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#EAE5E0] flex justify-between items-center">
          <h4 className="font-headline font-bold text-lg text-[#1F1B18]">Riwayat Transaksi</h4>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-[#D5CFC9] rounded text-xs font-bold text-[#5C5550] bg-white outline-none cursor-pointer"
          >
            <option value="Semua">Semua</option>
            <option value="Masuk">Masuk</option>
            <option value="Keluar">Keluar</option>
          </select>
        </div>
        {loading ? (
          <div className="py-16 text-center text-[#8E8680] text-sm font-semibold">
            <div className="w-6 h-6 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data saldo...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                  {["ID", "Tanggal", "Toko Daur Ulang", "Deskripsi", "Tipe", "Jumlah", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#5C5550]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5E0]">
                {filteredTransactions.map((tx) => (
                  <tr key={`${tx.id}-${tx.date}`} className="hover:bg-[#F5F3F0]/40 transition">
                    <td className="px-6 py-4 text-xs font-bold text-[#8E8680]">{tx.id}</td>
                    <td className="px-6 py-4 text-xs text-[#8E8680]">{tx.date}</td>
                    <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{tx.storeName}</td>
                    <td className="px-6 py-4 text-sm text-[#1F1B18] font-medium">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          tx.type === "masuk"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {tx.type === "masuk" ? "▲ Masuk" : "▼ Keluar"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-extrabold ${
                        tx.type === "masuk" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "masuk" ? "+" : "-"}
                      {fmtRp(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          tx.status === "Berhasil"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : tx.status === "Pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8E8680] text-sm font-semibold">
                      Belum ada transaksi saldo di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE5E0] bg-[#F5F3F0]/50">
              <h3 className="font-bold text-lg text-[#1F1B18]">Pencairan Dana Mitra</h3>
              <button onClick={closeModal} className="p-1 hover:bg-[#F5F3F0] rounded transition">
                <X size={18} className="text-[#8E8680]" />
              </button>
            </div>
            <div className="p-6">
              {!withdrawDone ? (
                <form onSubmit={handleWithdraw} className="space-y-5 text-left text-xs font-semibold text-[#5C5550]">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">
                      Jumlah Pencairan (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Rp 1.000.000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      min={50000}
                      className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#16A34A] bg-[#F5F3F0] transition"
                    />
                    <p className="text-[10px] text-[#8E8680] mt-1.5 font-medium">
                      Minimum pencairan dana platform Rp 50.000
                    </p>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">
                      Pilih Bank Tujuan
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`py-2.5 rounded-lg text-xs font-bold border-2 transition ${
                            selectedBank === bank
                              ? "border-[#16A34A] bg-blue-50 text-[#16A34A]"
                              : "border-[#EAE5E0] text-[#5C5550] hover:border-[#16A34A]"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">
                      Nomor Rekening Tujuan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#16A34A] bg-[#F5F3F0] transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-[#16A34A] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {submitting ? "Menyimpan..." : "Konfirmasi Pencairan"}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                    <CheckCircle size={36} className="text-green-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-[#1F1B18] mb-1">Permintaan Pencairan Berhasil!</h4>
                    <p className="text-xs text-[#8E8680] leading-relaxed max-w-xs mx-auto">
                      Dana sebesar <strong>{fmtRp(Number(withdrawAmount))}</strong> tercatat di database dengan
                      status pending. Dana masuk dalam 1×24 jam kerja.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-2 px-8 py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
