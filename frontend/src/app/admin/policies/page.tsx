"use client";

import React, { useState, useEffect } from "react";

export default function AdminPoliciesPage() {
  const [tos, setTos] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pelum_config_policies");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTos(parsed.tos || "");
        setPrivacyPolicy(parsed.privacyPolicy || "");
      } catch (e) {
        console.error("Failed to parse pelum_config_policies", e);
      }
    } else {
      // Defaults
      setTos(
        "1. Pengguna wajib memberikan data yang benar saat mendaftar.\n" +
        "2. Transaksi pembayaran QRIS manual wajib dikonfirmasi lewat chat admin.\n" +
        "3. Segala bentuk kecurangan transaksi akan berakibat pada pemblokiran akun secara permanen."
      );
      setPrivacyPolicy(
        "1. Kami mengumpulkan alamat email dan nomor telepon Anda untuk verifikasi keamanan akun.\n" +
        "2. Data transaksi Anda tidak akan pernah kami bagikan kepada pihak ketiga di luar platform Pelataran UMKM."
      );
    }
    setLoading(false);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = { tos, privacyPolicy };
    localStorage.setItem("pelum_config_policies", JSON.stringify(config));
    alert("Kebijakan & TOS berhasil diperbarui secara persisten!");
  };

  if (loading) {
    return <div className="p-8 text-sm text-[#8E8680]">Memuat kebijakan platform...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Kebijakan & TOS Platform</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Kelola dokumen syarat & ketentuan penggunaan (Terms of Service) serta kebijakan privasi data pengguna platform.
        </p>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
        <h3 className="font-headline font-bold text-lg border-b border-[#F5F3F0] pb-4">Dokumen Hukum Platform</h3>

        {/* Terms of Service */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
            Syarat & Ketentuan Penggunaan (TOS)
          </label>
          <textarea
            rows={8}
            required
            value={tos}
            onChange={(e) => setTos(e.target.value)}
            placeholder="Tulis Syarat & Ketentuan di sini..."
            className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body leading-relaxed"
          />
          <p className="text-[10px] text-[#5C5550]">
            Akan muncul pada form pendaftaran atau halaman bantuan Syarat & Ketentuan platform.
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
            Kebijakan Privasi (Privacy Policy)
          </label>
          <textarea
            rows={8}
            required
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            placeholder="Tulis Kebijakan Privasi di sini..."
            className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body leading-relaxed"
          />
          <p className="text-[10px] text-[#5C5550]">
            Mengatur cara platform mengelola dan melindungi data pribadi milik customer dan seller.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3F0]">
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition"
          >
            Simpan Kebijakan & TOS
          </button>
        </div>
      </form>
    </div>
  );
}
