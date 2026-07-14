"use client";

import React, { useState, useEffect } from "react";

export default function AdminContactPage() {
  const [waHotline, setWaHotline] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [hqAddress, setHqAddress] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pelum_config_contact");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWaHotline(parsed.waHotline || "");
        setSupportEmail(parsed.supportEmail || "");
        setHqAddress(parsed.hqAddress || "");
      } catch (e) {
        console.error("Failed to parse pelum_config_contact", e);
      }
    } else {
      // Defaults
      setWaHotline("08138298543");
      setSupportEmail("support@daurly.id");
      setHqAddress("Jl. Jenderal Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190");
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { waHotline, supportEmail, hqAddress };
    localStorage.setItem("pelum_config_contact", JSON.stringify(config));
    alert("Kontak & CS berhasil diperbarui secara persisten!");
  };

  if (loading) {
    return <div className="p-8 text-sm text-[#8E8680]">Memuat pengaturan kontak...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Kontak & Customer Service</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Atur informasi kontak resmi dan hotline layanan pelanggan untuk platform Daurly.
        </p>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <h3 className="font-headline font-bold text-lg border-b border-[#F5F3F0] pb-4">Informasi Layanan Pelanggan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Hotline */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Nomor WhatsApp Hotline
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E8680]">+62</span>
              <input
                type="text"
                required
                value={waHotline.startsWith("62") ? waHotline.slice(2) : waHotline.startsWith("0") ? waHotline.slice(1) : waHotline}
                onChange={(e) => setWaHotline("62" + e.target.value.replace(/\D/g, ""))}
                placeholder="8138298543"
                className="w-full pl-12 pr-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
              />
            </div>
            <p className="text-[10px] text-[#5C5550]">
              Hotline WA yang dihubungi pembeli saat transaksi manual e-wallet atau butuh bantuan admin.
            </p>
          </div>

          {/* Support Email */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
              Email Bantuan (Support Email)
            </label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@daurly.id"
              className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body font-bold"
            />
            <p className="text-[10px] text-[#5C5550]">
              Email resmi untuk korespondensi masalah teknis dan akun platform.
            </p>
          </div>
        </div>

        {/* HQ Address */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
            Alamat Kantor Pusat (HQ Address)
          </label>
          <textarea
            rows={3}
            required
            value={hqAddress}
            onChange={(e) => setHqAddress(e.target.value)}
            placeholder="Jl. Jenderal Sudirman No. 123..."
            className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3F0]">
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition"
          >
            Simpan Kontak & CS
          </button>
        </div>
      </form>
    </div>
  );
}
