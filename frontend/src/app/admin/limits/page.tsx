"use client";

import React, { useState, useEffect } from "react";

export default function AdminLimitsPage() {
  const [paymentTimeout, setPaymentTimeout] = useState("");
  const [shippingTimeout, setShippingTimeout] = useState("");
  const [minWithdraw, setMinWithdraw] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pelum_config_limits");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPaymentTimeout(parsed.paymentTimeout || "");
        setShippingTimeout(parsed.shippingTimeout || "");
        setMinWithdraw(parsed.minWithdraw || "");
      } catch (e) {
        console.error("Failed to parse pelum_config_limits", e);
      }
    } else {
      // Defaults
      setPaymentTimeout("24");
      setShippingTimeout("2");
      setMinWithdraw("50000");
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { paymentTimeout, shippingTimeout, minWithdraw };
    localStorage.setItem("pelum_config_limits", JSON.stringify(config));
    alert("Batas Waktu & Batasan Transaksi berhasil diperbarui secara persisten!");
  };

  if (loading) {
    return <div className="p-8 text-sm text-[#8E8680]">Memuat batasan waktu transaksi...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Batas Waktu & Batasan Transaksi</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Atur timer otomatis sistem logistik pembatalan pesanan dan nominal batas penarikan saldo keuangan seller.
        </p>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <h3 className="font-headline font-bold text-lg border-b border-[#F5F3F0] pb-4">Konfigurasi Batas Sistem</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Timeout */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Batas Waktu Pembayaran
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={paymentTimeout}
                onChange={(e) => setPaymentTimeout(e.target.value)}
                placeholder="24"
                className="w-full pl-4 pr-12 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">Jam</span>
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Maksimal waktu tunggu pembeli untuk melakukan pembayaran sebelum pesanan batal otomatis.
            </p>
          </div>

          {/* Shipping Timeout */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Batas Waktu Pengiriman
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={shippingTimeout}
                onChange={(e) => setShippingTimeout(e.target.value)}
                placeholder="2"
                className="w-full pl-4 pr-12 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">Hari</span>
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Batas waktu seller untuk mengirim barang sebelum pesanan dibatalkan otomatis dan saldo di-refund.
            </p>
          </div>

          {/* Minimum Withdrawal */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Batas Min. Tarik Saldo
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">Rp</span>
              <input
                type="number"
                required
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(e.target.value)}
                placeholder="50000"
                className="w-full pl-12 pr-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Jumlah saldo minimum yang harus dimiliki seller agar dapat mengajukan penarikan dana ke rekening.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3F0]">
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition"
          >
            Simpan Batas Waktu
          </button>
        </div>
      </form>
    </div>
  );
}
