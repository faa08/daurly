"use client";

import React, { useState, useEffect } from "react";

export default function AdminCommissionPage() {
  const [handlingFee, setHandlingFee] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pelum_config_commission");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHandlingFee(parsed.handlingFee || "");
        setCommissionRate(parsed.commissionRate || "");
      } catch (e) {
        console.error("Failed to parse pelum_config_commission", e);
      }
    } else {
      // Defaults
      setHandlingFee("1000");
      setCommissionRate("2.5");
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { handlingFee, commissionRate };
    localStorage.setItem("pelum_config_commission", JSON.stringify(config));
    alert("Tarif & Komisi berhasil diperbarui secara persisten!");
  };

  if (loading) {
    return <div className="p-8 text-sm text-[#8E8680]">Memuat pengaturan komisi...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Tarif & Komisi Platform</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Konfigurasi biaya administrasi aplikasi bagi pembeli serta potongan komisi transaksi bagi penjual.
        </p>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <h3 className="font-headline font-bold text-lg border-b border-[#F5F3F0] pb-4">Biaya Operasional Layanan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Handling Fee */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Biaya Layanan Aplikasi (Handling Fee)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">Rp</span>
              <input
                type="number"
                required
                value={handlingFee}
                onChange={(e) => setHandlingFee(e.target.value)}
                placeholder="1000"
                className="w-full pl-12 pr-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Biaya tetap yang ditambahkan pada total tagihan checkout customer.
            </p>
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Komisi Seller (Admin Fee Rate)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="2.5"
                className="w-full pl-4 pr-12 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">%</span>
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Potongan bagi hasil yang diambil platform dari total omzet setiap penjualan seller.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3F0]">
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition"
          >
            Simpan Tarif & Komisi
          </button>
        </div>
      </form>
    </div>
  );
}
