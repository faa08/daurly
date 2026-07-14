"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/backend/authService";
import { affiliateService } from "@/backend/affiliateService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertTriangle,
  Info,
  Loader2,
  ArrowLeft,
  Share2,
  CheckCircle,
  Shield,
  Clock,
} from "lucide-react";

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSocial, setRegSocial] = useState("");
  const [regNik, setRegNik] = useState("");
  const [regKtpName, setRegKtpName] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(() => {
    async function init() {
      const user = authService.getCurrentUser();
      if (!user) {
        router.push("/masuk?redirect=/affiliate/register");
        return;
      }
      setCurrentUser(user);
      setRegEmail(user.email || "");
      setRegPhone(user.no_telp || "");

      try {
        const refreshed = await authService.refreshSession();
        if (refreshed) {
          setCurrentUser(refreshed);
          setRegEmail(refreshed.email || "");
          setRegPhone(refreshed.no_telp || "");

          // If already affiliate or pending, redirect back
          if (refreshed.is_affiliate || refreshed.affiliate_status === "pending") {
            router.push("/affiliate");
            return;
          }
        }
      } catch (err) {
        console.error("Session refresh failed:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone.trim() || !regSocial.trim() || !regNik.trim() || !regKtpName.trim()) {
      setRegError("Semua kolom wajib diisi.");
      return;
    }

    if (!/^\d{16}$/.test(regNik.trim())) {
      setRegError("NIK KTP harus terdiri dari 16 digit angka.");
      return;
    }

    setRegistering(true);
    setRegError("");
    try {
      const res = await affiliateService.joinAffiliate({
        email: regEmail,
        phone: regPhone,
        social: regSocial,
        nik: regNik,
        ktpName: regKtpName,
      });

      alert(res.message);
      router.push("/affiliate");
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Gagal mendaftar affiliate.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
        <Header showProfile={true} />
        <main className="flex-1 flex justify-center items-center py-12">
          <Loader2 size={36} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Header showProfile={true} />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push("/affiliate")}
          className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-on-surface transition mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Affiliate
        </button>

        {/* Page header */}
        <div className="bg-gradient-to-br from-primary to-[#16A34A] rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Share2 size={24} />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-black">Pendaftaran Partner Affiliate</h1>
              <p className="text-white/70 text-sm">Daurly Affiliate Program</p>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mt-3">
            Isi formulir di bawah ini untuk mendaftar sebagai partner affiliate. Setelah pendaftaran dikirim,
            admin akan memverifikasi data Anda dalam waktu maksimal <strong className="text-white">1 hari kerja</strong>.
          </p>
        </div>

        {/* Requirements Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">Tanpa Minimal Followers</div>
              <div className="text-[10px] text-secondary mt-0.5">Akun medsos aktif sudah cukup</div>
            </div>
          </div>
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">Data Aman & Terverifikasi</div>
              <div className="text-[10px] text-secondary mt-0.5">KTP hanya untuk verifikasi</div>
            </div>
          </div>
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">Maks. 1 Hari Kerja</div>
              <div className="text-[10px] text-secondary mt-0.5">Proses verifikasi cepat</div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white border border-[#EAE5E0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F3F0]">
            <h2 className="font-headline text-lg font-black text-on-surface">Formulir Pendaftaran</h2>
            <p className="text-xs text-secondary mt-0.5">Pastikan semua data yang diisi benar dan valid.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary">Akun daurly Aktif (Username)</label>
              <input
                type="text"
                disabled
                value={currentUser?.username || ""}
                className="w-full px-4 py-3 border border-secondary-fixed bg-surface-container rounded-lg text-sm text-secondary font-semibold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary">Alamat Email Aktif</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary">Nomor HP Aktif (WhatsApp)</label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-3 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-secondary">Link / Akun Media Sosial Promosi</label>
              <input
                type="text"
                required
                value={regSocial}
                onChange={(e) => setRegSocial(e.target.value)}
                placeholder="Instagram/TikTok username atau link profil"
                className="w-full px-4 py-3 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition"
              />
              <span className="text-[10px] text-secondary">
                Tidak ada syarat minimal followers. Digunakan sebagai sarana promosi.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-secondary">Nomor NIK KTP</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={regNik}
                  onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ""))}
                  placeholder="16 digit nomor NIK"
                  className="w-full px-4 py-3 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-mono transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-secondary">Nama Lengkap (Sesuai KTP)</label>
                <input
                  type="text"
                  required
                  value={regKtpName}
                  onChange={(e) => setRegKtpName(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP"
                  className="w-full px-4 py-3 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition"
                />
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-blue-100 rounded-xl p-4 text-[11px] text-[#16A34A] flex items-start gap-2.5">
              <Info size={16} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">Catatan Penting:</span>
                <p className="mt-0.5 leading-normal">
                  Data rekening bank / nomor e-wallet untuk pencairan komisi diisi setelah pendaftaran disetujui.
                  Verifikasi membutuhkan waktu maksimal <strong>1 hari kerja</strong> oleh admin.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-[#F5F3F0]">
              <button
                type="button"
                onClick={() => router.push("/affiliate")}
                className="px-5 py-3 bg-none border border-secondary-fixed rounded-xl text-sm font-bold text-secondary cursor-pointer hover:bg-surface transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={registering}
                className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:brightness-95 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {registering ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Pendaftaran"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
