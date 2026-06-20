"use client";

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const [siteName, setSiteName] = useState("Pelataran UMKM Indonesia");
  const [siteDesc, setSiteDesc] = useState("Pusat digitalisasi dan pemasaran produk-produk UMKM unggulan dari seluruh nusantara.");

  const tabs = [
    { name: "General Settings", icon: "info" },
    { name: "User Roles & Permissions", icon: "supervised_user_circle" },
    { name: "Payment Gateway", icon: "payments" },
    { name: "Security Settings", icon: "security" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pengaturan Berhasil Disimpan!\nKategori: ${activeTab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "General Settings":
        return (
          <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left panel instructions */}
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Identitas Platform</h3>
              <p className="font-body text-xs text-[#3E3834] leading-relaxed">
                Informasi publik yang muncul pada frontend platform.
              </p>
            </div>

            {/* Right panel inputs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
                  Nama Situs
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
                  Deskripsi Platform
                </label>
                <textarea
                  rows={4}
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body leading-relaxed"
                />
              </div>

              {/* Logo platform */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
                  Logo Platform
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#212121] rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl text-primary-container font-bold">storefront</span>
                  </div>
                  <div className="space-y-2">
                    <button 
                      type="button" 
                      onClick={() => alert("Mengunggah berkas logo...")}
                      className="px-4 py-2 border-2 border-on-surface text-on-surface font-bold text-xs rounded hover:bg-surface-container transition"
                    >
                      Ganti Logo
                    </button>
                    <p className="text-[10px] text-[#3E3834]">
                      Format yang disarankan: PNG atau SVG transparan. Ukuran maksimal 2MB (Min. 512x512px).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case "User Roles & Permissions":
        return (
          <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Hak Akses Pengguna</h3>
              <p className="font-body text-xs text-[#3E3834] leading-relaxed">
                Kelola wewenang dan izin akses untuk setiap kategori akun pengguna di ekosistem platform.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-[#F5F3F0] text-xs font-bold text-[#3E3834] uppercase">
                      <th className="px-4 py-3">Peran / Role</th>
                      <th className="px-4 py-3 text-center">Verifikasi Toko</th>
                      <th className="px-4 py-3 text-center">Kelola Produk</th>
                      <th className="px-4 py-3 text-center">Akses Pengaturan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F3F0] text-xs font-semibold">
                    <tr className="hover:bg-surface-container-low/20 transition">
                      <td className="px-4 py-3 text-on-surface font-bold">Superadmin</td>
                      <td className="px-4 py-3 text-center text-green-600 font-extrabold">Ya</td>
                      <td className="px-4 py-3 text-center text-green-600 font-extrabold">Ya</td>
                      <td className="px-4 py-3 text-center text-green-600 font-extrabold">Ya</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/20 transition">
                      <td className="px-4 py-3 text-on-surface font-bold">Verifikator</td>
                      <td className="px-4 py-3 text-center text-green-600 font-extrabold">Ya</td>
                      <td className="px-4 py-3 text-center text-red-600 font-extrabold">Tidak</td>
                      <td className="px-4 py-3 text-center text-red-600 font-extrabold">Tidak</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/20 transition">
                      <td className="px-4 py-3 text-on-surface font-bold">Seller</td>
                      <td className="px-4 py-3 text-center text-red-600 font-extrabold">Tidak</td>
                      <td className="px-4 py-3 text-center text-green-600 font-extrabold">Ya (Milik Sendiri)</td>
                      <td className="px-4 py-3 text-center text-red-600 font-extrabold">Tidak</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button 
                type="button" 
                onClick={() => alert("Menambahkan Peran Baru...")}
                className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded hover:bg-zinc-700 transition"
              >
                + Tambah Peran Baru
              </button>
            </div>
          </section>
        );
      case "Payment Gateway":
        return (
          <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Gerbang Pembayaran</h3>
              <p className="font-body text-xs text-[#3E3834] leading-relaxed">
                Integrasi sistem pembayaran digital otomatis (E-Wallet, Virtual Account, Credit Card).
              </p>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-on-surface">Midtrans Gateway</p>
                    <p className="text-xs text-[#3E3834] font-medium">Pembayaran e-wallet (Gopay, OVO, ShopeePay) & VA bank otomatis.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">Midtrans Mode</label>
                  <select className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Sandbox (Uji Coba)</option>
                    <option>Production (Live)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">Client Key</label>
                    <input type="text" defaultValue="SB-Mid-client-Abc123xyz" className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">Server Key</label>
                    <input type="password" defaultValue="SB-Mid-server-Def456wuv" className="w-full px-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case "Security Settings":
        return (
          <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Keamanan Sistem</h3>
              <p className="font-body text-xs text-[#3E3834] leading-relaxed">
                Kelola proteksi data, kebijakan password, dan batasan administratif.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-6">
              {/* 2FA Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
                  Otentikasi Dua Faktor (2FA)
                </label>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <input type="checkbox" id="2fa-required" className="w-5 h-5 accent-primary cursor-pointer" />
                  <label htmlFor="2fa-required" className="text-xs text-[#3E3834] font-semibold cursor-pointer select-none">
                    Wajibkan semua akun admin menggunakan otentikasi dua faktor untuk login
                  </label>
                </div>
              </div>

              {/* Session Timeout Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E3834]">
                  Masa Sesi Nonaktif Admin
                </label>
                <div className="space-y-2">
                  <select className="w-full px-4 py-3 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-primary transition text-sm font-body leading-relaxed">
                    <option>15 Menit</option>
                    <option>30 Menit</option>
                    <option>1 Jam</option>
                  </select>
                  <p className="text-[10px] text-[#3E3834] font-medium">
                    Sesi admin akan otomatis keluar setelah periode tidak aktif yang ditentukan di atas.
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pengaturan Sistem</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Konfigurasi parameter operasional dan keamanan platform Pelataran UMKM.
        </p>
      </header>

      {/* Tabs */}
      <section className="bg-white rounded-xl p-1.5 flex flex-wrap gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
              activeTab === tab.name
                ? "bg-primary text-white"
                : "text-[#3E3834] hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </section>

      {/* Content Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {renderTabContent()}

        {/* Buttons Action bar */}
        <section className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "General Settings") {
                setSiteName("Pelataran UMKM Indonesia");
                setSiteDesc("Pusat digitalisasi dan pemasaran produk-produk UMKM unggulan dari seluruh nusantara.");
              } else {
                alert("Pengaturan dibatalkan.");
              }
            }}
            className="px-6 py-3 border-2 border-on-surface text-on-surface font-bold text-sm rounded hover:bg-surface-container transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition"
          >
            Simpan Perubahan
          </button>
        </section>
      </form>

      {/* System Status Panels */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-[#3E3834] font-bold">Status Server</p>
            <p className="text-sm font-extrabold text-green-600 mt-0.5">Optimal (99.9%)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined">history</span>
          </div>
          <div>
            <p className="text-xs text-[#3E3834] font-bold">Pembaruan Terakhir</p>
            <p className="text-sm font-extrabold text-on-surface mt-0.5">19 Juni 2026, 09:42</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <p className="text-xs text-[#3E3834] font-bold">Log Aktivitas</p>
            <p className="text-sm font-extrabold text-on-surface mt-0.5">45 Entry Baru</p>
          </div>
        </div>
      </section>
    </div>
  );
}
