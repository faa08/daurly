"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/backend/supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "General Settings");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [siteName, setSiteName] = useState("Pelataran UMKM Indonesia");
  const [siteDesc, setSiteDesc] = useState("Pusat digitalisasi dan pemasaran produk-produk UMKM unggulan dari seluruh nusantara.");

  // Voucher states
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "percentage",
    value: "",
    max_discount: "",
    min_purchase: "",
    is_active: true
  });

  const fetchVouchers = async () => {
    if (isPlaceholder()) return;
    setLoadingVouchers(true);
    try {
      const { data, error } = await supabase
        .from("voucher")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVouchers(data || []);
    } catch (err) {
      console.error("fetchVouchers failed:", err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Kupon & Diskon") {
      fetchVouchers();
    }
  }, [activeTab]);

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlaceholder()) {
      alert("Database placeholder aktif. Konfigurasi tidak dapat disimpan.");
      return;
    }
    if (!newVoucher.code.trim() || !newVoucher.value) return;

    try {
      const payload = {
        code: newVoucher.code.trim().toUpperCase(),
        discount_type: newVoucher.discount_type,
        value: Number(newVoucher.value),
        max_discount: newVoucher.max_discount ? Number(newVoucher.max_discount) : 0,
        min_purchase: newVoucher.min_purchase ? Number(newVoucher.min_purchase) : 0,
        is_active: newVoucher.is_active,
      };

      const { error } = await supabase.from("voucher").insert(payload);
      if (error) throw error;

      alert("Voucher berhasil ditambahkan!");
      setShowAddForm(false);
      setNewVoucher({ code: "", discount_type: "percentage", value: "", max_discount: "", min_purchase: "", is_active: true });
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menambah voucher: ${err.message}`);
    }
  };

  const handleToggleVoucher = async (id: string, currentStatus: boolean) => {
    if (isPlaceholder()) return;
    try {
      const { error } = await supabase
        .from("voucher")
        .update({ is_active: !currentStatus })
        .eq("id_voucher", id);
      if (error) throw error;
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal merubah status: ${err.message}`);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (isPlaceholder()) return;
    const ok = window.confirm("Apakah Anda yakin ingin menghapus voucher ini?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("voucher")
        .delete()
        .eq("id_voucher", id);
      if (error) throw error;
      fetchVouchers();
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menghapus voucher: ${err.message}`);
    }
  };

  const tabs = [
    { name: "General Settings", icon: "info" },
    { name: "User Roles & Permissions", icon: "supervised_user_circle" },
    { name: "Payment Gateway", icon: "payments" },
    { name: "Security Settings", icon: "security" },
    { name: "Kupon & Diskon", icon: "percent" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "Kupon & Diskon") return; // Handled separately
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
      case "Kupon & Diskon":
        return (
          <section className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="flex justify-between items-center border-b border-[#F5F3F0] pb-4">
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Manajemen Kupon & Voucher</h3>
                <p className="font-body text-xs text-[#3E3834] mt-0.5">
                  Buat, edit, dan nonaktifkan kupon diskon untuk transaksi pembeli.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-lg hover:bg-zinc-700 transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                {showAddForm ? "Batal" : "Tambah Voucher"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-[#FCFCFA] border border-surface-container p-6 rounded-xl space-y-4 text-xs">
                <h4 className="font-headline font-bold text-sm text-on-surface">Tambah Voucher Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kode Voucher</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: MERDEKA10"
                      value={newVoucher.code}
                      onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary uppercase font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Tipe Diskon</label>
                    <select
                      value={newVoucher.discount_type}
                      onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal Tetap (Rp)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                      Nilai Diskon ({newVoucher.discount_type === "percentage" ? "%" : "Rp"})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={newVoucher.discount_type === "percentage" ? "10" : "50000"}
                      value={newVoucher.value}
                      onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Min. Pembelian (Rp)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newVoucher.min_purchase}
                      onChange={(e) => setNewVoucher({ ...newVoucher, min_purchase: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
                      Maks. Diskon (Rp, Opsional)
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      disabled={newVoucher.discount_type === "fixed"}
                      value={newVoucher.max_discount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, max_discount: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-container rounded bg-white text-sm focus:outline-none focus:border-primary font-bold disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={handleAddVoucher}
                      className="w-full h-[38px] bg-[#1F1B18] text-white font-bold text-xs rounded hover:bg-[#3E3834] transition"
                    >
                      Simpan Voucher
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-surface-container rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low border-b border-[#F5F3F0] font-bold text-[#3E3834] uppercase tracking-wider">
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Tipe</th>
                    <th className="px-6 py-4">Nilai</th>
                    <th className="px-6 py-4">Min. Belanja</th>
                    <th className="px-6 py-4">Maks. Potongan</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F3F0] font-semibold text-[#1F1B18]">
                  {loadingVouchers ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#8E8680]">
                        Memuat data kupon...
                      </td>
                    </tr>
                  ) : vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#8E8680]">
                        Belum ada voucher aktif. Klik &quot;Tambah Voucher&quot; di atas.
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v) => (
                      <tr key={v.id_voucher} className="hover:bg-surface-container-low/20 transition">
                        <td className="px-6 py-4 font-bold text-blue-600 text-sm uppercase">{v.code}</td>
                        <td className="px-6 py-4 capitalize">{v.discount_type === "percentage" ? "Persentase" : "Nominal Tetap"}</td>
                        <td className="px-6 py-4 font-bold">
                          {v.discount_type === "percentage" ? `${v.value}%` : `Rp ${Number(v.value).toLocaleString("id-ID")}`}
                        </td>
                        <td className="px-6 py-4">Rp {Number(v.min_purchase).toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4">
                          {v.discount_type === "fixed" ? "-" : Number(v.max_discount) > 0 ? `Rp ${Number(v.max_discount).toLocaleString("id-ID")}` : "Tanpa Batas"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleVoucher(v.id_voucher, v.is_active)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border transition ${
                              v.is_active
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {v.is_active ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(v.id_voucher)}
                            className="text-[#8E8680] hover:text-red-600 transition p-1 hover:bg-[#F5F3F0] rounded"
                            title="Hapus Voucher"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#8E8680]">Memuat pengaturan...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
