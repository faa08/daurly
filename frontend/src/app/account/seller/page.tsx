"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService } from "@/backend/sellerService";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form states for the 6 required documents
  const [user, setUser] = useState<any>(null);
  const [namaToko, setNamaToko] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [email, setEmail] = useState("");
  const [rekening, setRekening] = useState("");
  const [ktp, setKtp] = useState("");
  const [nib, setNib] = useState("");
  const [ktpFileName, setKtpFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation functions
  const handleKtpChange = (val: string) => {
    setKtp(val);
    if (val.length > 0 && (val.length !== 16 || !/^\d+$/.test(val))) {
      setErrors(prev => ({ ...prev, ktp: "NIK KTP harus tepat 16 digit angka." }));
    } else {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.ktp;
        return copy;
      });
    }
  };

  const handlePhoneChange = (val: string) => {
    setNomorHp(val);
    if (val.length > 0 && !/^(\+62|0)8[1-9][0-9]{7,10}$/.test(val)) {
      setErrors(prev => ({ ...prev, nomorHp: "Nomor HP tidak valid (diawali 08/+62, 10-13 digit)." }));
    } else {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.nomorHp;
        return copy;
      });
    }
  };

  const handleNibChange = (val: string) => {
    setNib(val);
    if (val.length > 0 && (val.length !== 13 || !/^\d+$/.test(val))) {
      setErrors(prev => ({ ...prev, nib: "NIB harus tepat 13 digit angka." }));
    } else {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.nib;
        return copy;
      });
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email || "");
      setNomorHp(currentUser.no_telp || "");
    }
  }, []);

  const handleRegisterSeller = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final checks
    const finalErrors: Record<string, string> = {};
    if (ktp.length !== 16 || !/^\d+$/.test(ktp)) {
      finalErrors.ktp = "NIK KTP harus tepat 16 digit angka.";
    }
    if (!/^(\+62|0)8[1-9][0-9]{7,10}$/.test(nomorHp)) {
      finalErrors.nomorHp = "Nomor HP tidak valid (diawali 08/+62, 10-13 digit).";
    }
    if (nib.length !== 13 || !/^\d+$/.test(nib)) {
      finalErrors.nib = "NIB harus tepat 13 digit angka.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    if (!user) {
      alert("Anda harus login terlebih dahulu.");
      router.push("/masuk");
      return;
    }

    setErrors({});
    setLoading(true);
    
    const newSeller = await sellerService.registerSeller(
      user.id_user,
      namaToko,
      email,
      nomorHp,
      nib,
      ktp,
      rekening,
      ktpFileName
    );
    
    setLoading(false);
    
    if (newSeller) {
      setShowSuccessModal(true);
    } else {
      alert("Pendaftaran gagal. Silakan coba lagi.");
    }
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
                  onChange={(e) => handleNibChange(e.target.value)}
                  placeholder="13-digit nomor NIB"
                  className={`w-full px-3.5 py-2.5 bg-surface-container rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18] ${errors.nib ? "border-red-500" : "border-[#EAE5E0]"}`}
                />
                {errors.nib && <p className="text-red-500 text-[10px] mt-1 font-bold text-left">{errors.nib}</p>}
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
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+62 8xxx atau 08xxx"
                  className={`w-full px-3.5 py-2.5 bg-surface-container rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18] ${errors.nomorHp ? "border-red-500" : "border-[#EAE5E0]"}`}
                />
                {errors.nomorHp && <p className="text-red-500 text-[10px] mt-1 font-bold text-left">{errors.nomorHp}</p>}
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
                  onChange={(e) => handleKtpChange(e.target.value)}
                  placeholder="16-digit NIK KTP"
                  className={`w-full px-3.5 py-2.5 bg-surface-container rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold text-[#1F1B18] ${errors.ktp ? "border-red-500" : "border-[#EAE5E0]"}`}
                />
                {errors.ktp && <p className="text-red-500 text-[10px] mt-1 font-bold text-left">{errors.ktp}</p>}
              </div>
            </div>

            {/* Upload KTP File Mockup with Preview */}
            <div className="space-y-2 text-left">
              <label className="block text-[11px] uppercase tracking-wider text-secondary">Upload Dokumen KTP</label>
              <div className="border border-dashed border-[#D5CFC9] rounded-lg p-5 flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container/60 transition cursor-pointer relative overflow-hidden min-h-[120px]">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setKtpFileName(file.name);
                      setUploadProgress(0);
                      setUploadedImgUrl(null);
                      
                      let prog = 0;
                      const interval = setInterval(() => {
                        prog += 10;
                        setUploadProgress(prog);
                        if (prog >= 100) {
                          clearInterval(interval);
                          if (file.type.startsWith("image/")) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setUploadedImgUrl(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }, 100);
                    }
                  }}
                />
                {uploadProgress === null && !ktpFileName && (
                  <>
                    <span className="material-symbols-outlined text-secondary text-[28px] mb-1">upload_file</span>
                    <span className="text-[11px] text-[#1F1B18] font-bold">Pilih file KTP Anda</span>
                    <span className="text-[9px] text-secondary font-medium mt-0.5">Format JPG, PNG atau PDF (Maks. 5MB)</span>
                  </>
                )}

                {/* Progress bar */}
                {uploadProgress !== null && uploadProgress < 100 && (
                  <div className="w-full text-center space-y-2 py-2">
                    <span className="material-symbols-outlined text-primary text-[28px] animate-bounce">upload</span>
                    <p className="text-xs text-primary font-bold">Mengunggah: {uploadProgress}%</p>
                    <div className="w-full bg-[#EAE5E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Upload Success & Preview */}
                {uploadProgress === 100 && ktpFileName && (
                  <div className="w-full flex flex-col items-center justify-center space-y-3 py-1">
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                      <span>Unggah Selesai!</span>
                    </div>
                    {uploadedImgUrl ? (
                      <div className="relative w-full max-w-[200px] h-[120px] rounded-lg overflow-hidden border border-[#EAE5E0] shadow-sm bg-white">
                        <img src={uploadedImgUrl} alt="Preview KTP" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#EAE5E0]">
                        <span className="material-symbols-outlined text-[#8E8680]">description</span>
                        <span className="text-xs text-secondary font-bold truncate max-w-[150px]">{ktpFileName}</span>
                      </div>
                    )}
                    <span className="text-[9px] text-secondary underline">Klik untuk mengganti file</span>
                  </div>
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
                disabled={loading || !!errors.nomorHp || !!errors.ktp || !!errors.nib || !namaToko || !nomorHp || !ktp || !rekening || !nib || !ktpFileName || (uploadProgress !== null && uploadProgress < 100)}
                className={`px-8 py-2.5 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                  loading || !!errors.nomorHp || !!errors.ktp || !!errors.nib || !namaToko || !nomorHp || !ktp || !rekening || !nib || !ktpFileName || (uploadProgress !== null && uploadProgress < 100)
                    ? "bg-[#D5CFC9] cursor-not-allowed text-secondary"
                    : "bg-primary hover:bg-primary-dark hover:shadow cursor-pointer"
                }`}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-surface-container rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600 mx-auto">
              <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-xl text-on-surface">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Toko Anda <strong>{namaToko}</strong> telah terdaftar secara sah di Pelataran UMKM dengan NIB <strong>{nib}</strong>.
              </p>
            </div>

            <div className="bg-[#F5F3F0] border border-[#EAE5E0] rounded-xl p-4 text-left text-[11px] text-secondary space-y-2 font-medium">
              <div className="flex justify-between"><span className="font-bold">Pemilik:</span><span>{user?.name || "Siti Rahayu"}</span></div>
              <div className="flex justify-between"><span className="font-bold">Email:</span><span>{email}</span></div>
              <div className="flex justify-between"><span className="font-bold">No. HP:</span><span>{nomorHp}</span></div>
              <div className="flex justify-between"><span className="font-bold">Rekening:</span><span className="truncate max-w-[180px]">{rekening}</span></div>
            </div>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/seller/products");
              }}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition"
            >
              Masuk ke Dashboard Seller
            </button>
          </div>
        </div>
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
