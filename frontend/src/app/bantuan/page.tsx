"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Tag, 
  Store, 
  Search, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  ArrowLeft,
  Award,
  HelpCircle
} from "lucide-react";
import Footer from "@/components/Footer";

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
    label: "Mitra & Merchant", 
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
    question: "Bagaimana cara melacak pengiriman pesanan saya?",
    answer: "Masuk ke Akun > Pesanan Saya. Pilih produk yang ingin Anda lacak, klik 'Lacak Pengiriman'. Anda akan melihat status kurir secara real-time beserta nomor resi pengiriman yang terintegrasi langsung dengan jasa logistik."
  },
  {
    id: "faq-4",
    topicId: "pesanan",
    question: "Berapa lama batas waktu pembayaran pesanan sebelum dibatalkan otomatis?",
    answer: "Batas waktu pembayaran pesanan adalah 1x24 jam sejak pesanan dibuat. Jika pembayaran tidak diterima atau belum terverifikasi dalam batas waktu tersebut, sistem Pelataran UMKM akan membatalkan pesanan secara otomatis demi keamanan stok penjual."
  },
  // Pembayaran
  {
    id: "faq-5",
    topicId: "pembayaran",
    question: "Metode pembayaran apa saja yang didukung oleh Pelataran UMKM?",
    answer: "Kami mendukung berbagai pilihan pembayaran aman: Virtual Account bank (BCA, Mandiri, BNI, BRI), e-Wallet (GoPay, OVO, ShopeePay, DANA), Transfer Bank manual, serta QRIS."
  },
  {
    id: "faq-6",
    topicId: "pembayaran",
    question: "Bagaimana cara mengonfirmasi pembayaran jika menggunakan transfer bank manual?",
    answer: "Jika menggunakan Transfer Bank Manual, Anda harus masuk ke detail Pesanan dan klik 'Konfirmasi Pembayaran'. Unggah foto bukti transfer ATM atau screenshot M-Banking Anda agar tim keuangan kami dapat memproses pesanan dalam kurun waktu maks. 15 menit."
  },
  // Pengiriman
  {
    id: "faq-7",
    topicId: "pengiriman",
    question: "Bagaimana cara menghitung estimasi ongkos kirim ke lokasi saya?",
    answer: "Ongkos kirim dihitung secara otomatis berdasarkan berat produk, dimensi, serta jarak dari alamat toko penjual ke alamat pengiriman Anda saat berada di halaman checkout."
  },
  {
    id: "faq-8",
    topicId: "pengiriman",
    question: "Apakah Pelataran UMKM mendukung pengiriman instan/sameday?",
    answer: "Ya, kami mendukung pengiriman instan dan sameday (GoSend/GrabExpress) selama merchant/penjual mengaktifkan fitur tersebut di toko mereka dan jarak pengantaran berada di dalam jangkauan kurir."
  },
  // Pengembalian
  {
    id: "faq-9",
    topicId: "pengembalian",
    question: "Bagaimana syarat mengajukan komplain atau pengembalian barang yang rusak?",
    answer: "Anda wajib menyertakan video unboxing paket secara utuh tanpa jeda/edit saat mengajukan klaim pengembalian di menu detail pesanan. Permohonan pengembalian harus diajukan maksimal 2x24 jam sejak paket dinyatakan diterima oleh kurir."
  },
  {
    id: "faq-10",
    topicId: "pengembalian",
    question: "Berapa lama proses pengembalian dana (refund) selesai?",
    answer: "Proses pengembalian dana memakan waktu 1-3 hari kerja setelah produk yang dikembalikan disetujui oleh penjual atau ditengahi oleh admin Pelataran UMKM. Dana refund akan ditransfer ke saldo e-wallet Anda atau nomor rekening terdaftar."
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
    question: "Bagaimana langkah mendaftar menjadi Seller di Pelataran UMKM?",
    answer: "Klik menu 'Mulai Jual / Jadi Seller' di navigasi atas atau menu akun Anda. Isi informasi detail toko (Nama Toko, Alamat Penjemputan, Nomor Telepon Aktif, Kategori Produk) lalu ikuti panduan verifikasi identitas KTP. Proses persetujuan memakan waktu maks. 24 jam."
  },
  {
    id: "faq-14",
    topicId: "mitra",
    question: "Apa saja keuntungan menjadi Mitra UMKM Terverifikasi?",
    answer: "Mitra UMKM Terverifikasi mendapatkan badge pelindung hijau khusus di toko mereka, prioritas eksposur produk di halaman beranda, potongan biaya administrasi bulanan, serta akses ke dasbor analitik penjualan tingkat lanjut secara gratis."
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── CUSTOM CARE HEADER ── */}
      <header className="bg-white border-b border-[#EAE5E0] sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1200px] w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-secondary hover:text-primary transition" title="Kembali ke Beranda">
              <ArrowLeft size={16} />
            </Link>
            <div className="h-5 w-[1px] bg-[#EAE5E0]" />
            <Link href="/bantuan" className="flex items-center gap-2">
              <div className="logo-stripes-small">
                <span className="stripe-orange-small"></span>
                <span className="stripe-gray-small"></span>
              </div>
              <span className="logo-text-bold-small text-on-surface">Pelataran</span>
              <span className="bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide">CARE</span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link 
              href="/chat" 
              className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-[#1D4ED8] transition"
            >
              <Mail size={15} />
              Pesan Bantuan
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-950 flex items-center justify-center text-white text-xs font-bold border border-[#EAE5E0]">
              G
            </div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">game</span>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER SECTION ── */}
      <section className="bg-gradient-to-b from-[#FFFDFB] via-[#FFFBF9] to-surface border-b border-[#EAE5E0] py-10 px-6 relative overflow-hidden">
        {/* Abstract background vector colors */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(232,96,10,0.05)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(142,134,128,0.03)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          {/* Left Text / Search Block */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Awards indicators */}
            <div className="flex flex-wrap gap-2 select-none">
              <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[9px] font-extrabold px-2 py-0.5 rounded border border-primary-pale flex items-center gap-1">
                <Award size={10} />
                CCW World Winner 2019-2022
              </span>
              <span className="bg-stone-100 text-stone-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                <Award size={10} />
                Indonesia CS Champion 2022-2023
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                Selamat Malam, <span className="text-primary">game</span>
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
                placeholder="Ketik kata kunci (misal: pengembalian barang, cara jadi seller)"
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

      {/* ── STICKY FLOATING CHAT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-40 max-w-[340px] w-full bg-white border border-primary/20 rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-pale text-primary flex items-center justify-center flex-shrink-0 relative">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white absolute bottom-0 right-0 animate-ping" />
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white absolute bottom-0 right-0" />
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-[10px] text-secondary font-extrabold uppercase leading-none">Butuh Bantuan Lebih?</p>
            <p className="text-xs font-extrabold text-on-surface mt-1 leading-snug">Mulai chat dengan TANYA</p>
          </div>
        </div>
        <Link 
          href="/chat"
          className="bg-primary text-white text-[11px] font-extrabold px-3 py-2 rounded-lg hover:brightness-95 active:scale-95 transition flex-shrink-0"
        >
          Mulai Chat
        </Link>
      </div>

      <Footer />
    </div>
  );
}
