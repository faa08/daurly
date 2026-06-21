"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states for the 6 required documents
  const [namaToko, setNamaToko] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [email, setEmail] = useState("siti.rahayu@email.com");
  const [rekening, setRekening] = useState("");
  const [ktp, setKtp] = useState("");
  const [nib, setNib] = useState("");
  const [ktpFileName, setKtpFileName] = useState("");

  const handleRegisterSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert(`Pendaftaran Seller Berhasil!\n\nNama Toko: ${namaToko}\nNIB: ${nib}\nEmail: ${email}\n\nSelamat datang di Pelataran UMKM Seller.`);
      router.push("/seller/products");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Gabung Sebagai Seller</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Buka toko Anda sekarang dan mulailah memasarkan produk lokal unggulan Anda ke seluruh Indonesia.
        </p>
      </header>

      {showForm ? (
        /* Registration Form for the 6 Documents */
        <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-surface-container pb-4">
            <button 
              onClick={() => setShowForm(false)}
              className="p-1.5 hover:bg-surface-container rounded-lg transition text-secondary flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_back</span>
            </button>
            <div className="text-left">
              <h3 className="font-headline font-bold text-lg text-on-surface">Formulir Pendaftaran Seller</h3>
              <p className="text-[11px] text-secondary font-medium">Lengkapi 6 dokumen persyaratan di bawah ini.</p>
            </div>
          </div>

          <form onSubmit={handleRegisterSeller} className="space-y-5 font-semibold text-xs text-secondary">
            {/* Nama Toko & NIB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">Nama Toko</label>
                <input 
                  type="text" 
                  required
                  value={namaToko}
                  onChange={(e) => setNamaToko(e.target.value)}
                  placeholder="Masukkan nama toko Anda"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">NIB (Nomor Induk Berusaha)</label>
                <input 
                  type="text" 
                  required
                  value={nib}
                  onChange={(e) => setNib(e.target.value)}
                  placeholder="13-digit nomor NIB"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>
            </div>

            {/* Email & Nomor HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">Email Aktif</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">Nomor HP Aktif</label>
                <input 
                  type="tel" 
                  required
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  placeholder="+62 8xxx"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>
            </div>

            {/* Rekening Bank & NIK KTP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">Rekening Bank</label>
                <input 
                  type="text" 
                  required
                  value={rekening}
                  onChange={(e) => setRekening(e.target.value)}
                  placeholder="Nama Bank - No. Rekening (a.n Pemilik)"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-secondary">Nomor KTP (NIK)</label>
                <input 
                  type="text" 
                  required
                  value={ktp}
                  onChange={(e) => setKtp(e.target.value)}
                  placeholder="16-digit NIK KTP"
                  className="w-full px-3.5 py-2.5 bg-surface-container rounded-lg border border-[#EAE5E0] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18]"
                />
              </div>
            </div>

            {/* Upload KTP File Mockup */}
            <div className="space-y-2 text-left">
              <label className="block text-[11px] uppercase tracking-wider text-secondary">Upload Dokumen KTP</label>
              <div className="border border-dashed border-[#D5CFC9] rounded-lg p-5 flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container/60 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setKtpFileName(e.target.files[0].name);
                    }
                  }}
                />
                <span className="material-symbols-outlined text-secondary text-[28px] mb-1">upload_file</span>
                {ktpFileName ? (
                  <span className="text-xs text-primary font-bold">{ktpFileName}</span>
                ) : (
                  <>
                    <span className="text-[11px] text-[#1F1B18] font-bold">Pilih file KTP Anda</span>
                    <span className="text-[9px] text-secondary font-medium mt-0.5">Format JPG, PNG atau PDF (Maks. 5MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-2 text-left">
              <input type="checkbox" required id="agree" className="mt-0.5 accent-primary w-4 h-4" />
              <label htmlFor="agree" className="text-[11px] leading-relaxed select-none font-medium text-secondary">
                Saya menyatakan bahwa semua dokumen yang diunggah adalah sah dan benar, serta menyetujui <a href="/syarat-ketentuan" className="text-primary hover:underline font-bold">Syarat & Ketentuan</a> Pelataran UMKM Seller.
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-surface-container hover:bg-[#EBE8E2] text-secondary font-bold text-xs rounded-lg transition"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Kirim Pendaftaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          {/* Main Welcome Promo Card */}
          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm flex flex-col items-center text-center gap-6 max-w-2xl mx-auto py-12">
            <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">storefront</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-xl text-on-surface">
                Jual produk UMKM mu dengan menjadi seller
              </h3>
              <p className="text-xs text-secondary font-medium leading-relaxed max-w-md">
                Dapatkan kemudahan mengelola produk, memantau penjualan, dan berinteraksi langsung dengan pembeli melalui dashboard seller yang terintegrasi.
              </p>
            </div>

            <button 
              onClick={() => setShowForm(true)}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>Buka Toko</span>
            </button>
          </section>

          {/* Required Documents Info Card */}
          <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2 border-b border-surface-container pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">description</span>
              Dokumen Persyaratan Seller
            </h3>
            <p className="text-xs text-secondary font-medium">
              Untuk mendaftar sebagai seller, harap siapkan dokumen berikut:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-secondary font-body list-none pl-0">
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">1</span>
                KTP
              </li>
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
                Nomor HP Aktif
              </li>
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">3</span>
                Email Aktif
              </li>
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">4</span>
                Rekening Bank
              </li>
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">5</span>
                Nama Toko
              </li>
              <li className="flex items-center gap-3 bg-[#F5F3F0] px-3.5 py-2.5 rounded-lg border border-[#EAE5E0]">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">6</span>
                NIB (Nomor Induk Berusaha)
              </li>
            </ul>
          </section>
        </>
      )}

      {/* Benefits Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">payments</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Komisi 0%</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Semua hasil penjualan masuk ke rekening Anda tanpa potongan biaya admin yang memberatkan.
          </p>
        </div>

        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">trending_up</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Jangkauan Nasional</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Pasarkan produk kerajinan dan kuliner Anda ke pembeli dari Sabang sampai Merauke.
          </p>
        </div>

        <div className="bg-white border border-surface-container p-5 rounded-xl space-y-2 text-center shadow-xs">
          <span className="material-symbols-outlined text-primary text-2xl">support_agent</span>
          <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">Pendampingan</h4>
          <p className="text-[11px] text-secondary leading-relaxed font-medium">
            Dapatkan dukungan pelatihan digital marketing gratis untuk mengembangkan bisnis Anda.
          </p>
        </div>
      </section>
    </div>
  );
}
