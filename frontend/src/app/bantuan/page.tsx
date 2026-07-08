"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  ShieldCheck, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Tag, 
  Store, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle
} from "lucide-react";
import { authService, USER_UPDATED_EVENT } from "@/backend/authService";
import { getTimeGreeting } from "@/lib/greeting";

// Help center topics with color tokens and icons
const TOPICS = [
  { 
    id: "akun", 
    label: "Akun & Keamanan", 
    icon: ShieldCheck, 
    bgColor: "bg-emerald-50", 
    textColor: "text-emerald-700", 
    borderColor: "border-emerald-100" 
  },
  { 
    id: "pesanan", 
    label: "Pesanan", 
    icon: ShoppingBag, 
    bgColor: "bg-blue-50", 
    textColor: "text-blue-700", 
    borderColor: "border-blue-100" 
  },
  { 
    id: "pembayaran", 
    label: "Pembayaran", 
    icon: CreditCard, 
    bgColor: "bg-amber-50", 
    textColor: "text-amber-700", 
    borderColor: "border-amber-100" 
  },
  { 
    id: "pengiriman", 
    label: "Pengiriman", 
    icon: Truck, 
    bgColor: "bg-teal-50", 
    textColor: "text-teal-700", 
    borderColor: "border-teal-100" 
  },
  { 
    id: "pengembalian", 
    label: "Pengembalian Barang", 
    icon: RefreshCw, 
    bgColor: "bg-rose-50", 
    textColor: "text-rose-700", 
    borderColor: "border-rose-100" 
  },
  { 
    id: "promosi", 
    label: "Promosi & Voucher", 
    icon: Tag, 
    bgColor: "bg-purple-50", 
    textColor: "text-purple-700", 
    borderColor: "border-purple-100" 
  },
  { 
    id: "mitra", 
    label: "Mitra Konsinyasi", 
    icon: Store, 
    bgColor: "bg-indigo-50", 
    textColor: "text-indigo-700", 
    borderColor: "border-indigo-100" 
  },
];

// Rich set of FAQ articles categorized by topic
const FAQ_ARTICLES = [
  // Akun & Keamanan
  {
    id: "faq-1",
    topicId: "akun",
    question: "Bagaimana cara mengubah kata sandi akun saya?",
    answer: "Untuk mengubah kata sandi Anda: Masuk ke halaman Profil Anda > Pengaturan Keamanan > Klik 'Ubah Kata Sandi'. Masukkan kata sandi lama Anda diikuti dengan kata sandi baru Anda yang aman (minimal 8 karakter dengan kombinasi angka dan simbol), lalu klik Simpan."
  },
  {
    id: "faq-2",
    topicId: "akun",
    question: "Apa yang harus saya lakukan jika akun saya dicurigai diretas?",
    answer: "Jika Anda mendeteksi aktivitas mencurigakan, segera ganti kata sandi Anda. Anda juga bisa menghubungi tim Support kami melalui tombol Chat Bantuan TANYA dengan menyertakan bukti transaksi atau login terakhir Anda agar kami dapat mengamankan akun sementara waktu."
  },
  // Pesanan
  {
    id: "faq-3",
    topicId: "pesanan",
    question: "Bagaimana cara melacak pesanan saya?",
    answer: "Masuk ke Akun > Pesanan Saya. Pantau status (Diproses, Dikirim, Selesai). Untuk pembayaran digital, gunakan tombol Chat Pengiriman untuk koordinasi dengan admin platform. Nomor resi (jika ada) tampil di detail pesanan."
  },
  {
    id: "faq-4",
    topicId: "pesanan",
    question: "Kapan pesanan saya dianggap selesai?",
    answer: "Klik 'Pesanan Selesai' setelah barang diterima (pengiriman) atau setelah ambil & bayar di toko (pickup). Admin juga dapat menandai selesai. Setelah itu Anda bisa memberi ulasan atau mengajukan return."
  },
  // Pembayaran
  {
    id: "faq-5",
    topicId: "pembayaran",
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Dua pilihan saat checkout: (1) Bayar Digital via Midtrans — VA, e-wallet, kartu kredit; (2) Ambil di Toko — bayar & ambil sendiri di lokasi Daurly Cilegon tanpa ongkir."
  },
  {
    id: "faq-6",
    topicId: "pembayaran",
    question: "Apa yang terjadi setelah saya bayar digital?",
    answer: "Pembayaran diverifikasi otomatis. Admin platform akan menghubungi Anda lewat Chat Pengiriman untuk mengatur pengiriman — bukan perajin/penjual langsung."
  },
  // Pengiriman
  {
    id: "faq-7",
    topicId: "pengiriman",
    question: "Siapa yang mengatur pengiriman pesanan saya?",
    answer: "Daurly (platform) yang mengatur pengiriman dalam model konsinyasi. Setelah bayar digital, admin koordinasi alamat dan jadwal lewat chat. Perajin menitipkan barang, bukan mengirim sendiri ke pembeli."
  },
  {
    id: "faq-8",
    topicId: "pengiriman",
    question: "Bagaimana cara ambil barang di toko?",
    answer: "Pilih 'Ambil di Toko' saat checkout, konfirmasi alamat pickup, lalu datang ke Ruko BBS Cilegon untuk bayar dan ambil barang. Lihat detail alamat di halaman Pembayaran & Pickup."
  },
  // Pengembalian
  {
    id: "faq-9",
    topicId: "pengembalian",
    question: "Bagaimana cara mengajukan return?",
    answer: "Dari Pesanan Saya > tab Selesai > Ajukan Return. Isi alasan, lalu Anda diarahkan ke Chat Return dengan admin. Siapkan bukti (terutama video unboxing tanpa edit) sesuai Kebijakan Return."
  },
  {
    id: "faq-10",
    topicId: "pengembalian",
    question: "Bukti apa yang diperlukan untuk return?",
    answer: "Video unboxing dari paket tersegel, foto kondisi barang & kerusakan, screenshot pesanan, serta kelengkapan aksesoris. Detail lengkap ada di halaman Kebijakan Return."
  },
  // Promosi
  {
    id: "faq-11",
    topicId: "promosi",
    question: "Bagaimana cara mengklaim dan menggunakan voucher toko?",
    answer: "Kunjungi halaman profil toko penjual pilihan Anda, klik 'Klaim' pada voucher yang tersedia. Voucher akan otomatis diterapkan di halaman checkout apabila total pesanan Anda memenuhi kriteria minimal belanja yang dipersyaratkan."
  },
  {
    id: "faq-12",
    topicId: "promosi",
    question: "Mengapa kode voucher promo saya tidak dapat digunakan saat checkout?",
    answer: "Hal ini dapat disebabkan karena kuota promo harian telah habis, masa berlaku voucher telah kadaluarsa, atau produk dalam keranjang belanja Anda tidak memenuhi syarat & ketentuan promo tersebut."
  },
  // Mitra & Merchant
  {
    id: "faq-13",
    topicId: "mitra",
    question: "Bagaimana perajin/mitra menitipkan produk daur ulang (konsinyasi)?",
    answer: "Hubungi tim Daurly via halaman Kontak atau Customer Service. Setelah kerja sama konsinyasi disepakati, admin mendaftarkan toko dan produk daur ulang Anda. Platform yang urus transaksi, pembayaran, dan layanan ke pembeli — pendapatan dicatat ke saldo mitra."
  },
  {
    id: "faq-14",
    topicId: "mitra",
    question: "Apakah perajin perlu mengirim pesanan sendiri?",
    answer: "Tidak. Dalam model konsinyasi, pengiriman dan chat ke pembeli ditangani admin platform Daurly. Perajin fokus pada kualitas produk daur ulang dan ketersediaan stok."
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState(() => getTimeGreeting());
  const [displayName, setDisplayName] = useState("Anda");

  useEffect(() => {
    const syncUser = () => {
      const user = authService.getCurrentUser();
      setDisplayName(user?.nama_lengkap || user?.username || "Anda");
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener(USER_UPDATED_EVENT, syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(USER_UPDATED_EVENT, syncUser);
    };
  }, []);

  useEffect(() => {
    const tick = () => setGreeting(getTimeGreeting());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Filter FAQs based on query and/or selected topic
  const filteredFaqs = useMemo(() => {
    return FAQ_ARTICLES.filter((faq) => {
      const matchesTopic = selectedTopic ? faq.topicId === selectedTopic : true;
      const matchesQuery = searchQuery
        ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesTopic && matchesQuery;
    });
  }, [searchQuery, selectedTopic]);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="bg-surface">
      {/* ── HERO BANNER SECTION ── */}
      <section className="bg-gradient-to-b from-[#FFFDFB] via-[#FFFBF9] to-surface border-b border-[#EAE5E0] py-10 px-6 relative overflow-hidden">
        {/* Abstract background vector colors */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(232,96,10,0.05)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(142,134,128,0.03)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Text / Search Block */}
          <div className="lg:col-span-7 space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                {greeting}, <span className="text-primary">{displayName}</span>
              </h2>
              <p className="text-sm font-semibold text-secondary">
                Ada kendala atau pertanyaan? Temukan solusinya dengan cepat di sini.
              </p>
            </div>

            {/* Interactive Search input */}
            <div className="relative w-full max-w-lg shadow-sm rounded-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Ketik kata kunci (misal: pengembalian barang, mitra konsinyasi)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-[#EAE5E0] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface font-semibold placeholder-secondary/60 transition"
              />
            </div>
          </div>

          {/* Right Illustrations Block */}
          <div className="lg:col-span-5 hidden lg:flex justify-end items-center relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#EAE5E0] animate-[spin_40s_linear_infinite]" />
              
              {/* Inner Circle with Mascot elements representation */}
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#EFF6FF] to-[#FFF9F6] border border-[#EAE5E0] flex items-center justify-center relative shadow-sm">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-lg bg-white border border-[#EAE5E0] flex items-center justify-center text-primary shadow-xs">
                  <ShieldCheck size={24} />
                </div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-lg bg-white border border-[#EAE5E0] flex items-center justify-center text-primary shadow-xs">
                  <ShoppingBag size={24} />
                </div>
                <div className="absolute top-20 left-4 w-10 h-10 rounded-lg bg-white border border-[#EAE5E0] flex items-center justify-center text-secondary shadow-xs">
                  <Truck size={20} />
                </div>
                <div className="absolute bottom-20 right-4 w-10 h-10 rounded-lg bg-white border border-[#EAE5E0] flex items-center justify-center text-secondary shadow-xs">
                  <CreditCard size={20} />
                </div>
                
                <div className="text-center space-y-1">
                  <HelpCircle size={44} className="text-primary mx-auto animate-bounce" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Pusat Informasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOPICS SECTION ── */}
      <section className="max-w-[1200px] w-full mx-auto px-6 py-10 space-y-6">
        <div className="text-center sm:text-left space-y-1">
          <h3 className="font-headline text-lg font-bold text-on-surface">Pilih topik sesuai kendala Anda</h3>
          <p className="text-xs text-secondary font-semibold">Gunakan kategori topik berikut untuk mempersempit pencarian Anda</p>
        </div>

        {/* Topics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* All Topics Card */}
          <button
            onClick={() => setSelectedTopic(null)}
            className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-3 text-center transition cursor-pointer select-none group hover:shadow-md ${
              selectedTopic === null
                ? "bg-primary text-white border-primary"
                : "bg-white text-secondary border-[#EAE5E0] hover:bg-stone-50 hover:text-on-surface"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              selectedTopic === null ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
            }`}>
              <HelpCircle size={20} />
            </div>
            <span className="text-[10px] font-extrabold tracking-wide uppercase leading-tight">Semua Topik</span>
          </button>

          {/* Topic-specific cards */}
          {TOPICS.map((topic) => {
            const IconComponent = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-3 text-center transition cursor-pointer select-none group hover:shadow-md ${
                  isSelected
                    ? `${topic.bgColor} ${topic.textColor} border-primary ring-2 ring-primary/10`
                    : `bg-white text-secondary border-[#EAE5E0] hover:bg-stone-50 hover:text-on-surface`
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  isSelected 
                    ? "bg-white text-primary border border-primary/20" 
                    : `${topic.bgColor} ${topic.textColor} group-hover:scale-105`
                }`}>
                  <IconComponent size={20} />
                </div>
                <span className="text-[10px] font-extrabold tracking-wide uppercase leading-tight">
                  {topic.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ACCORDION SECTION ── */}
      <section className="max-w-[760px] w-full mx-auto px-6 pb-20 flex-1 space-y-6">
        <div className="flex justify-between items-center border-b border-[#EAE5E0] pb-4">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            Pertanyaan Terpopuler
            {selectedTopic && (
              <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[9px] font-extrabold px-2 py-0.5 rounded capitalize">
                {selectedTopic}
              </span>
            )}
          </h3>
          <span className="text-xs text-secondary font-semibold">
            {filteredFaqs.length} Artikel
          </span>
        </div>

        {/* FAQ list */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const currentTopic = TOPICS.find((t) => t.id === faq.topicId);
              const TopicIcon = currentTopic?.icon || HelpCircle;

              return (
                <article 
                  key={faq.id} 
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                    isOpen ? "border-primary shadow-sm ring-1 ring-primary/5" : "border-[#EAE5E0] hover:border-secondary-container"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 transition hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        currentTopic?.bgColor || "bg-stone-100"
                      } ${currentTopic?.textColor || "text-stone-600"}`}>
                        <TopicIcon size={14} />
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-on-surface leading-snug">
                        {faq.question}
                      </h4>
                    </div>
                    <div>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-secondary flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#EAE5E0]/40 text-xs sm:text-sm text-secondary font-semibold leading-relaxed bg-[#FFFDFB]/60">
                      {faq.answer}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-12 text-center text-secondary text-sm font-semibold shadow-xs space-y-2">
            <HelpCircle className="text-secondary/40 mx-auto" size={40} />
            <p>Tidak ada artikel bantuan ditemukan.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedTopic(null); }}
              className="text-xs text-primary font-bold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
