"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Copy,
  DollarSign,
  TrendingUp,
  Link as LinkIcon,
  CheckCircle,
  HelpCircle,
  Users,
  Loader2,
  Info,
  Clock,
  MessageSquare,
  AlertTriangle,
  X,
  ArrowLeft,
} from "lucide-react";
import { authService, User } from "@/backend/authService";
import { affiliateService, AffiliateStats, PayoutRequest } from "@/backend/affiliateService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCustomerService } from "@/components/CustomerServiceProvider";

export default function AffiliatePage() {
  const router = useRouter();
  const { open: openCustomerService } = useCustomerService();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversions" | "withdrawals">("conversions");
  
  // Dashboard data
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Link generator
  const [inputProductUrl, setInputProductUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  // Payout Form Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutBank, setPayoutBank] = useState("BCA");
  const [payoutNoRek, setPayoutNoRek] = useState("");
  const [payoutAtasNama, setPayoutAtasNama] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState("");

  // Copy success indicator
  const [copiedText, setCopiedText] = useState(false);
  const [copiedGenText, setCopiedGenText] = useState(false);

  // Registration Form state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSocial, setRegSocial] = useState("");
  const [regNik, setRegNik] = useState("");
  const [regKtpName, setRegKtpName] = useState("");
  const [regError, setRegError] = useState("");

  const loadAffiliateData = async () => {
    setStatsLoading(true);
    try {
      const [statsData, payoutsData] = await Promise.all([
        affiliateService.getAffiliateStats(),
        affiliateService.getPayouts(),
      ]);
      setStats(statsData);
      setPayouts(payoutsData);
    } catch (err) {
      console.error("Gagal memuat data affiliate:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    async function syncSession() {
      try {
        const updatedUser = await authService.refreshSession();
        if (updatedUser) {
          setCurrentUser(updatedUser);
          if (updatedUser.is_affiliate) {
            loadAffiliateData();
            if (typeof window !== "undefined") {
              setGeneratedUrl(`${window.location.origin}?ref=${updatedUser.affiliate_code}`);
            }
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi session:", err);
      } finally {
        setLoading(false);
      }
    }

    const user = authService.getCurrentUser();
    if (!user) {
      router.push("/masuk?redirect=/affiliate");
      return;
    }
    setCurrentUser(user);
    syncSession();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      setRegEmail(currentUser.email || "");
      setRegPhone(currentUser.no_telp || currentUser.affiliate_phone || "");
    }
  }, [currentUser, isRegisterModalOpen]);

  const handleJoinProgram = async (e: React.FormEvent) => {
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
      
      const updatedUser = await authService.refreshSession();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      setIsRegisterModalOpen(false);
      alert(res.message);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Gagal mendaftar affiliate.");
    } finally {
      setRegistering(false);
    }
  };

  const handleGenerateLink = () => {
    if (!currentUser?.affiliate_code) return;
    if (!inputProductUrl) {
      setGeneratedUrl(`${window.location.origin}?ref=${currentUser.affiliate_code}`);
      return;
    }

    try {
      const url = new URL(inputProductUrl);
      url.searchParams.set("ref", currentUser.affiliate_code);
      setGeneratedUrl(url.toString());
    } catch (err) {
      // Jika URL tidak valid, anggap itu path lokal
      const base = window.location.origin;
      const cleanPath = inputProductUrl.startsWith("/") ? inputProductUrl : `/${inputProductUrl}`;
      const separator = cleanPath.includes("?") ? "&" : "?";
      setGeneratedUrl(`${base}${cleanPath}${separator}ref=${currentUser.affiliate_code}`);
    }
  };

  const handleCopyLink = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    setPayoutSubmitting(true);

    const amount = Number(payoutAmount);
    if (!amount || amount < 50000) {
      setPayoutError("Minimal penarikan adalah Rp50.000");
      setPayoutSubmitting(false);
      return;
    }

    if (stats && stats.saldoAktif < amount) {
      setPayoutError("Saldo aktif Anda tidak mencukupi.");
      setPayoutSubmitting(false);
      return;
    }

    try {
      await affiliateService.requestPayout({
        amount,
        namaBank: payoutBank,
        noRek: payoutNoRek,
        atasNama: payoutAtasNama,
      });

      alert("Pengajuan penarikan dana berhasil dikirim.");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
      setPayoutNoRek("");
      setPayoutAtasNama("");
      loadAffiliateData();
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Gagal mengajukan penarikan dana.");
    } finally {
      setPayoutSubmitting(false);
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
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* JIKA BELUM DAFTAR AFFILIATE */}
        {!currentUser?.is_affiliate ? (
          currentUser?.affiliate_status === "pending" ? (
            /* TAMPILAN PENDING VERIFIKASI */
            <div className="max-w-xl mx-auto bg-white border border-[#EAE5E0] rounded-2xl shadow-md p-6 sm:p-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                <Clock size={32} className="animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
              <div className="space-y-2">
                <h2 className="font-headline text-xl sm:text-2xl font-black tracking-tight text-on-surface">
                  Pendaftaran Sedang Ditinjau
                </h2>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                  Terima kasih telah mendaftar sebagai partner affiliate Daurly! Pendaftaran Anda saat ini sedang dalam proses verifikasi oleh Admin.
                </p>
                <div className="bg-[#FFF9F6] border border-orange-100 rounded-xl p-4 text-[11px] sm:text-xs text-orange-800 text-left space-y-1 mt-4">
                  <span className="font-extrabold">Informasi Verifikasi:</span>
                  <p>Verifikasi membutuhkan waktu maksimal <strong>1 hari kerja</strong> oleh admin Daurly. Kami akan mengirimkan notifikasi setelah akun Anda disetujui.</p>
                </div>
              </div>

              <div className="border-t border-[#F5F3F0] pt-6 text-left space-y-3">
                <span className="text-[10px] sm:text-xs font-bold text-[#8E8680] uppercase tracking-wider">Data Pendaftaran Anda:</span>
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-2 gap-x-4 text-[11px] sm:text-xs">
                  <div className="text-secondary">Nama Lengkap KTP:</div>
                  <div className="font-bold text-on-surface sm:border-l sm:pl-3 border-[#F5F3F0]">{currentUser.affiliate_ktp_name}</div>
                  
                  <div className="text-secondary">NIK KTP:</div>
                  <div className="font-bold text-on-surface sm:border-l sm:pl-3 border-[#F5F3F0]">{currentUser.affiliate_nik}</div>
                  
                  <div className="text-secondary">No. Handphone:</div>
                  <div className="font-bold text-on-surface sm:border-l sm:pl-3 border-[#F5F3F0]">{currentUser.affiliate_phone}</div>
                  
                  <div className="text-secondary">Akun Media Sosial:</div>
                  <div className="font-bold text-on-surface break-all sm:border-l sm:pl-3 border-[#F5F3F0]">{currentUser.affiliate_social}</div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 px-5 py-3 bg-[#F5F3F0] text-secondary hover:bg-[#EAE5E0] font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Beranda
                </button>
                <button
                  type="button"
                  onClick={openCustomerService}
                  className="flex-1 px-5 py-3 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DBEAFE] font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  Hubungi Admin CS
                </button>
              </div>
            </div>
          ) : (
            /* TAMPILAN LANDING GABUNG AFFILIATE (NONE ATAU REJECTED) */
            <div className="space-y-8 animate-fade-in">
              {currentUser?.affiliate_status === "rejected" && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Pendaftaran Sebelumnya Ditolak:</span>
                    <p className="text-xs text-red-700 mt-0.5">
                      Pendaftaran affiliate Anda sebelumnya ditolak oleh admin karena belum memenuhi kriteria. Silakan periksa kembali data Anda dan ajukan pendaftaran ulang di bawah ini.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-primary-fixed to-white border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="space-y-4 max-w-xl">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Baru
                  </span>
                  <h2 className="font-headline text-3xl font-extrabold text-on-surface">
                    Bergabunglah dengan Affiliate Center Daurly!
                  </h2>
                  <p className="text-secondary-fixed-variant text-base leading-relaxed">
                    Mulai rekomendasikan produk daur ulang favorit Anda ke teman, keluarga, atau media sosial. 
                    Dapatkan komisi saldo sebesar <strong>5%</strong> untuk setiap transaksi sukses yang dilakukan lewat link rujukan Anda.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => router.push("/affiliate/register")}
                    className="px-8 py-4 bg-primary text-white text-base font-bold rounded-xl hover:brightness-95 shadow-md transition-all active:scale-95 flex items-center gap-3 cursor-pointer relative z-10"
                  >
                    <Share2 size={20} />
                    Gabung Affiliate Center
                  </button>
                </div>
              </div>

              {/* CARA KERJA SECTION */}
              <section className="space-y-6">
                <h3 className="font-headline text-xl font-bold text-on-surface text-center">
                  Bagaimana Cara Kerjanya?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      1
                    </div>
                    <h4 className="font-headline text-base font-bold text-on-surface">Ajukan Pendaftaran</h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      Isi data pendaftaran seperti email, nomor HP, NIK KTP, dan akun media sosial Anda untuk ditinjau oleh admin.
                    </p>
                  </div>
                  <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      2
                    </div>
                    <h4 className="font-headline text-base font-bold text-on-surface">Bagikan Link</h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      Salin link produk apa saja yang ingin Anda promosikan dengan menyisipkan kode rujukan unik Anda setelah disetujui.
                    </p>
                  </div>
                  <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      3
                    </div>
                    <h4 className="font-headline text-base font-bold text-on-surface">Dapatkan Saldo</h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      Ketika pembeli menyelesaikan transaksi, komisi otomatis masuk ke saldo Anda dan bisa dicairkan ke rekening bank.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )
        ) : (
          /* JIKA SUDAH DAFTAR AFFILIATE (DASHBOARD ACTIVE) */
          <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-3xl font-extrabold text-on-surface">Affiliate Center</h2>
                <p className="text-secondary mt-1 text-sm">
                  Kelola link rujukan, pantau komisi, dan ajukan penarikan dana.
                </p>
              </div>
              <div className="bg-primary-fixed border border-outline-variant px-4 py-2.5 rounded-xl flex items-center gap-3">
                <Users size={18} className="text-primary" />
                <span className="text-xs text-on-primary-fixed">Kode Affiliate Anda:</span>
                <span className="text-sm font-black text-primary">{currentUser.affiliate_code}</span>
              </div>
            </header>

            {/* STATS GRID */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Saldo Tersedia */}
              <div className="bg-white border border-surface-container rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px] relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider">Saldo Tersedia</span>
                  <h3 className="text-lg sm:text-2xl font-black text-primary">
                    Rp {(stats?.saldoAktif || 0).toLocaleString("id-ID")}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={!stats || stats.saldoAktif < 50000}
                  className="w-full mt-4 py-2 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-lg hover:brightness-95 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DollarSign size={14} />
                  Tarik Komisi
                </button>
              </div>

              {/* Card 2: Komisi Pending */}
              <div className="bg-white border border-surface-container rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    Komisi Pending
                    <div className="group relative">
                      <HelpCircle size={12} className="cursor-pointer text-secondary" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-inverse-surface text-inverse-on-surface text-[10px] p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all leading-normal z-50">
                        Komisi dari transaksi yang sedang dikirim/diproses. Cair saat transaksi selesai.
                      </div>
                    </div>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-secondary">
                    Rp {(stats?.saldoPending || 0).toLocaleString("id-ID")}
                  </h3>
                </div>
                <p className="text-[9px] sm:text-[10px] text-secondary mt-auto">Akan cair setelah pembeli menerima pesanan.</p>
              </div>

              {/* Card 3: Total Klik */}
              <div className="bg-white border border-surface-container rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider">Total Klik Link</span>
                  <h3 className="text-lg sm:text-2xl font-black text-on-surface">
                    {stats?.totalKlik || 0}
                  </h3>
                </div>
                <p className="text-[9px] sm:text-[10px] text-secondary mt-auto">Jumlah pengunjung unik via link referral Anda.</p>
              </div>

              {/* Card 4: Total Rujukan Sukses */}
              <div className="bg-white border border-surface-container rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-wider">Total Konversi</span>
                  <h3 className="text-lg sm:text-2xl font-black text-on-surface">
                    {stats?.conversions.filter(c => c.statusOrder === "selesai").length || 0}
                  </h3>
                </div>
                <p className="text-[9px] sm:text-[10px] text-secondary mt-auto">Jumlah pesanan rujukan yang berhasil selesai.</p>
              </div>
            </section>

            {/* LINK GENERATOR / BUILDER */}
            <section className="bg-white border border-surface-container rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-headline text-base font-extrabold text-on-surface flex items-center gap-2">
                <LinkIcon size={18} className="text-primary" />
                Pembuat Link Affiliate Kustom
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Tempel URL produk Daurly di bawah ini untuk membuat link affiliate kustom Anda secara instan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Contoh: https://daurly.com/produk/sepatu-kulit"
                  value={inputProductUrl}
                  onChange={(e) => setInputProductUrl(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleGenerateLink}
                  className="px-5 py-2.5 bg-secondary text-white text-sm font-bold rounded-lg hover:brightness-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp size={16} />
                  Buat Link
                </button>
              </div>

              {generatedUrl && (
                <div className="mt-4 p-4 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between gap-4">
                  <span className="text-xs font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-thin text-secondary flex-1">
                    {generatedUrl}
                  </span>
                  <button
                    onClick={() => handleCopyLink(generatedUrl, setCopiedGenText)}
                    className="flex-shrink-0 p-2 bg-white border border-surface-container-high rounded-lg hover:bg-surface text-secondary transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    {copiedGenText ? (
                      <>
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-[10px] font-bold text-green-600">Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="text-[10px] font-bold">Salin</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {/* DETAILS TABS TABLE */}
            <section className="space-y-4">
              {/* Tab buttons */}
              <div className="flex border-b border-surface-container-highest">
                <button
                  onClick={() => setActiveTab("conversions")}
                  className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "conversions"
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-on-surface"
                  }`}
                >
                  Konversi Rujukan
                  <span className="bg-surface-container-highest text-secondary text-xs px-2 py-0.5 rounded-full">
                    {stats?.conversions.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("withdrawals")}
                  className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === "withdrawals"
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-on-surface"
                  }`}
                >
                  Riwayat Penarikan
                  <span className="bg-surface-container-highest text-secondary text-xs px-2 py-0.5 rounded-full">
                    {payouts.length}
                  </span>
                </button>
              </div>

              {/* Tab Content: Conversions */}
              {activeTab === "conversions" && (
                <div className="bg-white border border-surface-container rounded-2xl overflow-hidden shadow-sm">
                  {statsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                  ) : !stats?.conversions.length ? (
                    <div className="text-center py-12 space-y-2">
                      <Info size={32} className="mx-auto text-secondary" />
                      <p className="text-sm text-secondary">Belangan rujukan belum ada.</p>
                      <p className="text-xs text-secondary-fixed-variant">Ayo bagikan link produk untuk mendapatkan komisi pertamamu!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-surface-container border-b border-surface-container-high text-xs font-bold text-secondary uppercase">
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">Produk</th>
                            <th className="p-4">Pembeli</th>
                            <th className="p-4">Harga</th>
                            <th className="p-4">Komisi</th>
                            <th className="p-4">Status Pesanan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.conversions.map((conv) => {
                            let statusBadge = "bg-yellow-50 text-yellow-700 border-yellow-200";
                            if (conv.statusOrder === "selesai") statusBadge = "bg-green-50 text-green-700 border-green-200";
                            if (conv.statusOrder === "dibatalkan") statusBadge = "bg-red-50 text-red-700 border-red-200";

                            return (
                              <tr key={conv.id_order_item} className="border-b border-surface-container hover:bg-surface-container-lowest">
                                <td className="p-4 text-xs font-mono text-secondary">
                                  {conv.tanggal ? new Date(conv.tanggal).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) : "—"}
                                </td>
                                <td className="p-4 font-bold text-on-surface max-w-[200px] truncate">
                                  {conv.nama_produk}
                                </td>
                                <td className="p-4 text-secondary">{conv.pembeli}</td>
                                <td className="p-4 font-mono">Rp {conv.harga.toLocaleString("id-ID")}</td>
                                <td className="p-4 font-mono font-bold text-primary">
                                  Rp {conv.komisi.toLocaleString("id-ID")}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${statusBadge}`}>
                                    {conv.statusOrder === "pending" ? "Menunggu Bayar" : conv.statusOrder}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Withdrawals */}
              {activeTab === "withdrawals" && (
                <div className="bg-white border border-surface-container rounded-2xl overflow-hidden shadow-sm">
                  {statsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                  ) : !payouts.length ? (
                    <div className="text-center py-12 space-y-2">
                      <Info size={32} className="mx-auto text-secondary" />
                      <p className="text-sm text-secondary">Belum ada pengajuan penarikan dana.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-surface-container border-b border-surface-container-high text-xs font-bold text-secondary uppercase">
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">Jumlah</th>
                            <th className="p-4">Rekening</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Catatan Admin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payouts.map((pay) => {
                            let statusBadge = "bg-yellow-50 text-yellow-700 border-yellow-200";
                            if (pay.status === "selesai") statusBadge = "bg-green-50 text-green-700 border-green-200";
                            if (pay.status === "ditolak") statusBadge = "bg-red-50 text-red-700 border-red-200";
                            if (pay.status === "diproses") statusBadge = "bg-blue-50 text-blue-700 border-blue-200";

                            return (
                              <tr key={pay.id_penarikan} className="border-b border-surface-container hover:bg-surface-container-lowest">
                                <td className="p-4 text-xs font-mono text-secondary">
                                  {new Date(pay.created_at).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="p-4 font-mono font-bold text-on-surface">
                                  Rp {pay.jumlah.toLocaleString("id-ID")}
                                </td>
                                <td className="p-4 text-xs text-secondary leading-relaxed">
                                  {pay.nama_bank} - {pay.no_rek}<br />
                                  a.n. <strong className="text-on-surface">{pay.atas_nama}</strong>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${statusBadge}`}>
                                    {pay.status}
                                  </span>
                                </td>
                                <td className="p-4 text-xs text-secondary max-w-[200px] truncate">
                                  {pay.catatan_admin || "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* WITHDRAWAL FORM MODAL */}
            {isPayoutModalOpen && stats && (
              <div className="fixed inset-0 bg-[rgba(31,27,24,0.4)] backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
                <div className="bg-white border border-surface-container-high rounded-2xl p-6 shadow-xl w-full max-w-md animate-slide-up space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-lg font-bold text-on-surface">Tarik Saldo Komisi</h3>
                    <button
                      onClick={() => setIsPayoutModalOpen(false)}
                      className="text-secondary hover:text-on-surface text-xl font-bold p-1"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="p-3 bg-primary-fixed border border-outline-variant rounded-xl text-xs flex items-center gap-2">
                    <Info size={14} className="text-primary flex-shrink-0" />
                    <span className="text-secondary-fixed-variant leading-relaxed">
                      Minimal penarikan dana adalah **Rp50.000**.
                    </span>
                  </div>

                  {payoutError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {payoutError}
                    </div>
                  )}

                  <form onSubmit={handlePayoutSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-secondary">Jumlah Penarikan (Rp)</label>
                      <input
                        type="number"
                        required
                        placeholder="Minimal 50000"
                        min="50000"
                        max={stats.saldoAktif}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                      />
                      <span className="text-[10px] text-secondary">
                        Maksimal yang dapat ditarik: Rp {stats.saldoAktif.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-secondary">Bank Tujuan</label>
                        <select
                          value={payoutBank}
                          onChange={(e) => setPayoutBank(e.target.value)}
                          className="w-full px-3 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BNI">BNI</option>
                          <option value="BRI">BRI</option>
                          <option value="Gopay">GoPay (E-Wallet)</option>
                          <option value="Ovo">OVO (E-Wallet)</option>
                          <option value="Dana">DANA (E-Wallet)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-secondary">Nomor Rekening / HP</label>
                        <input
                          type="text"
                          required
                          value={payoutNoRek}
                          onChange={(e) => setPayoutNoRek(e.target.value)}
                          className="w-full px-4 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-secondary">Atas Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        required
                        value={payoutAtasNama}
                        onChange={(e) => setPayoutAtasNama(e.target.value)}
                        className="w-full px-4 py-2 border border-secondary-fixed rounded-lg focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsPayoutModalOpen(false)}
                        className="px-4 py-2 bg-none border border-secondary-fixed rounded-lg text-sm font-bold text-secondary cursor-pointer hover:bg-surface"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={payoutSubmitting}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-95 active:scale-98 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {payoutSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          "Kirim Pengajuan"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
