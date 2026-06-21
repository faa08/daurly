"use client";

import React, { useState } from "react";
import { Wallet, Clock, ArrowDownCircle, TrendingUp, X, CheckCircle } from "lucide-react";

const BANKS = ["BCA", "BNI", "Mandiri", "BRI"];

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "masuk" | "keluar";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
}

const TRANSACTIONS: Transaction[] = [
  { id: "TXN-001", date: "28 Okt 2023", description: "Pembayaran Order INV/20231028/001", type: "masuk", amount: 450000, status: "Berhasil" },
  { id: "TXN-002", date: "27 Okt 2023", description: "Pembayaran Order INV/20231027/002", type: "masuk", amount: 175000, status: "Berhasil" },
  { id: "TXN-003", date: "26 Okt 2023", description: "Penarikan Dana ke BCA 1234****", type: "keluar", amount: 500000, status: "Berhasil" },
  { id: "TXN-004", date: "25 Okt 2023", description: "Pembayaran Order INV/20231025/003", type: "masuk", amount: 850000, status: "Berhasil" },
  { id: "TXN-005", date: "24 Okt 2023", description: "Pembayaran Order INV/20231024/004", type: "masuk", amount: 125000, status: "Pending" },
  { id: "TXN-006", date: "23 Okt 2023", description: "Penarikan Dana ke Mandiri 5678****", type: "keluar", amount: 300000, status: "Berhasil" },
  { id: "TXN-007", date: "22 Okt 2023", description: "Pembayaran Order INV/20231022/005", type: "masuk", amount: 210000, status: "Berhasil" },
  { id: "TXN-008", date: "21 Okt 2023", description: "Pembayaran Order INV/20231021/006", type: "masuk", amount: 95000, status: "Gagal" },
];

function fmtRp(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

export default function SellerSaldoPage() {
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawDone, setWithdrawDone] = useState(false);

  function handleWithdraw(e: React.FormEvent) { e.preventDefault(); setWithdrawDone(true); }

  function closeModal() {
    setShowModal(false); setWithdrawDone(false);
    setWithdrawAmount(""); setAccountNumber(""); setSelectedBank("BCA");
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Saldo & Keuangan</h2>
        <p className="font-body text-body-md text-secondary mt-1">Kelola saldo, tarik dana, dan lihat riwayat transaksi toko Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#1E40AF] text-white rounded-xl p-6 shadow-lg flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-80"><Wallet size={16} /><span className="text-xs font-bold uppercase tracking-wider">Saldo Tersedia</span></div>
            <p className="text-3xl font-extrabold tracking-tight">Rp 2.450.000</p>
            <p className="text-xs opacity-70 font-medium">Dapat ditarik sewaktu-waktu</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-lg hover:brightness-95 transition shadow-md">
            <ArrowDownCircle size={16} /> Tarik Dana
          </button>
        </div>
        <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-secondary"><Clock size={16} /><span className="text-xs font-bold uppercase tracking-wider">Saldo Pending</span></div>
          <p className="text-2xl font-extrabold text-on-surface">Rp 850.000</p>
          <p className="text-xs text-secondary font-medium leading-relaxed">Menunggu konfirmasi pengiriman selesai dari pembeli.</p>
          <div className="flex items-center gap-1.5 pt-1"><TrendingUp size={13} className="text-green-600" /><span className="text-xs text-green-600 font-semibold">2 transaksi pending</span></div>
        </div>
      </div>

      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h4 className="font-headline font-bold text-lg text-on-surface">Riwayat Transaksi</h4>
          <select className="px-3 py-1.5 border border-surface-container rounded text-xs font-bold text-secondary bg-white outline-none cursor-pointer">
            <option>Semua</option><option>Masuk</option><option>Keluar</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                {["ID", "Tanggal", "Deskripsi", "Tipe", "Jumlah", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low/40 transition">
                  <td className="px-6 py-4 text-xs font-bold text-secondary">{tx.id}</td>
                  <td className="px-6 py-4 text-xs text-secondary">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-on-surface font-medium">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${tx.type === "masuk" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {tx.type === "masuk" ? "▲ Masuk" : "▼ Keluar"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-extrabold ${tx.type === "masuk" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "masuk" ? "+" : "-"}{fmtRp(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${tx.status === "Berhasil" ? "bg-green-50 text-green-700 border-green-200" : tx.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container">
              <h3 className="font-bold text-lg text-on-surface">Tarik Dana</h3>
              <button onClick={closeModal} className="p-1 hover:bg-surface-container rounded transition"><X size={18} className="text-secondary" /></button>
            </div>
            <div className="p-6">
              {!withdrawDone ? (
                <form onSubmit={handleWithdraw} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Jumlah Penarikan</label>
                    <input type="number" placeholder="Rp 100.000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required min={50000} className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary transition" />
                    <p className="text-xs text-secondary mt-1.5">Minimum penarikan Rp 50.000</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Pilih Bank</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BANKS.map((bank) => (
                        <button key={bank} type="button" onClick={() => setSelectedBank(bank)} className={`py-2.5 rounded-lg text-sm font-bold border-2 transition ${selectedBank === bank ? "border-primary bg-primary-container text-primary" : "border-surface-container text-secondary hover:border-primary"}`}>{bank}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Nomor Rekening</label>
                    <input type="text" placeholder="Contoh: 1234567890" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-on-surface outline-none focus:border-primary transition" />
                  </div>
                  <button type="submit" className="w-full h-12 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">Konfirmasi Penarikan</button>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center"><CheckCircle size={36} className="text-green-600" strokeWidth={1.5} /></div>
                  <div>
                    <h4 className="text-lg font-extrabold text-on-surface mb-1">Permintaan Berhasil!</h4>
                    <p className="text-sm text-secondary leading-relaxed">Dana sedang diproses ke {selectedBank}. Masuk dalam 1×24 jam kerja.</p>
                  </div>
                  <button onClick={closeModal} className="mt-2 px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">Tutup</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
