"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronRight, ArrowLeft, Trash2, Leaf, AlertTriangle, Recycle, 
  CheckCircle2, XCircle, Globe, Droplets, Banknote, ShieldAlert,
  HelpCircle, ChevronDown, CheckSquare, Square, Lightbulb, Zap, ArrowRight,
  Package, Box, Cpu, Beaker, TreePine, Droplet
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <Globe size={24} />, title: "Bebaskan TPA dari Beban", desc: "Sampah yang tercampur bikin TPA cepat penuh dan berisiko meledak karena gas metana. Dipilah = gampang diolah.", color: "text-blue-600 bg-blue-100" },
  { icon: <Recycle size={24} />, title: "Daur Ulang Jadi Super Mudah", desc: "Plastik atau kertas yang tercampur kuah sisa makanan bakal rusak dan nggak laku didaur ulang. Tetap pisahkan!", color: "text-green-600 bg-green-100" },
  { icon: <Banknote size={24} />, title: "Ubah Sampah Jadi Cuan", desc: "Sampah anorganik bersih itu ibarat uang receh lho! Kumpulkan dan setor ke bank sampah, lumayan buat tambahan.", color: "text-yellow-600 bg-yellow-100" },
  { icon: <ShieldAlert size={24} />, title: "Cegah Bau & Penyakit", desc: "Pisahkan sampah organik basah dari yang kering agar rumahmu tetap wangi, bersih, dan bebas dari sarang nyamuk.", color: "text-red-600 bg-red-100" },
];

const WASTE_TYPES = [
  { 
    title: "Sampah Organik", icon: <Leaf size={28} />, color: "green",
    desc: "Sampah dapur atau sisa makhluk hidup yang gampang banget membusuk secara alami.",
    examples: "Sisa makanan, kulit buah, tulang ayam, daun kering, bumbu dapur basi.",
    tips: "Jangan langsung dibuang! Kumpulkan di wadah tertutup untuk dijadikan pupuk kompos atau pakan maggot (BSF)."
  },
  { 
    title: "Sampah Plastik", icon: <Trash2 size={28} />, color: "yellow",
    desc: "Material awet yang butuh ratusan tahun untuk hancur. Musuh utama lautan kita jika tidak dikelola.",
    examples: "Botol air mineral, gelas boba, kantong kresek, kemasan sabun cuci, sachet kopi.",
    tips: "Selalu bilas bersih sisa minuman/makanan, keringkan, lalu remas botol agar hemat tempat di tempat sampah."
  },
  { 
    title: "Sampah Kertas", icon: <Box size={28} />, color: "blue",
    desc: "Material berbahan dasar serat pohon. Gampang banget didaur ulang asalkan kondisinya kering.",
    examples: "Kardus paketan, kertas HVS, koran bekas, buku tulis lama.",
    tips: "Pastikan kertas tetap kering. Kertas atau kardus yang sudah kena minyak (seperti kotak martabak) masuknya ke residu!"
  },
  { 
    title: "Kaca & Logam", icon: <Beaker size={28} />, color: "gray",
    desc: "Material keras yang istimewa karena bisa didaur ulang terus-menerus tanpa batas dan tanpa turun kualitas.",
    examples: "Botol sirup, toples selai kaca, kaleng soda, kaleng susu kental manis, paku.",
    tips: "Untuk pecahan kaca tajam, bungkus dulu dengan koran tebal atau kardus lalu selotip sebelum dibuang agar aman."
  },
  { 
    title: "Sampah B3", icon: <AlertTriangle size={28} />, color: "red",
    desc: "Bahan Berbahaya & Beracun. Sangat dilarang dibuang sembarangan karena bisa meracuni air tanah.",
    examples: "Baterai bekas, lampu bohlam/neon, kaleng aerosol (obat nyamuk/parfum), kosmetik kadaluarsa.",
    tips: "Jangan pernah mencampur B3 dengan sampah lain. Kumpulkan khusus dan salurkan ke pengelola limbah spesifik."
  },
  { 
    title: "E-Waste", icon: <Cpu size={28} />, color: "orange",
    desc: "Barang elektronik mati atau rusak yang komponennya mengandung logam berat namun berharga.",
    examples: "Kabel charger putus, HP jadul, baterai laptop bengkak, setrika rusak.",
    tips: "Banyak layanan jemput e-waste gratis. Cukup kumpulkan di kardus dan hubungi agen e-waste terdekat."
  },
];

const MISTAKES = [
  { wrong: "Membuang botol minuman beserta sisa airnya.", right: "Selalu kosongkan cairan ke wastafel terlebih dahulu. Cairan merusak sampah kertas di sekitarnya." },
  { wrong: "Membuang kotak pizza penuh minyak ke tong kertas.", right: "Kertas berminyak tidak bisa didaur ulang. Potong bagian berminyak ke residu, sisanya ke tong kertas." },
  { wrong: "Langsung membuang pecahan kaca ke kresek.", right: "Bahaya untuk petugas! Selalu bungkus tebal pecahan kaca dengan koran/kardus dan beri label." },
  { wrong: "Menggabungkan baterai bekas ke tempat sampah biasa.", right: "Sediakan satu toples kecil khusus di rumah untuk mengumpulkan baterai bekas (B3)." },
  { wrong: "Memasukkan styrofoam makanan ke tong plastik.", right: "Styrofoam sangat sulit didaur ulang (residu). Sebisa mungkin tolak penggunaannya dari awal." },
  { wrong: "Malas mencuci kotak makan plastik bekas delivery.", right: "Bilas kilat dengan sedikit sabun. Plastik berlemak tinggi sering ditolak oleh pendaur ulang." },
  { wrong: "Membuang botol plastik beserta tutup botolnya.", right: "Lepaskan tutup botol! Tutup botol (HDPE) dan badan botol (PET) beda jenis plastiknya." },
  { wrong: "Pikir 'Nanti juga disatukan sama tukang sampah'.", right: "Tetap pilah! Berikan kantong daur ulang langsung ke pemulung/petugas agar tidak disatukan." },
];

const FACTS = [
  "Mendaur ulang 1 ton kertas sama dengan menyelamatkan 17 pohon dewasa dari penebangan.",
  "Botol kaca butuh waktu hingga 1 juta tahun untuk bisa hancur sepenuhnya di alam.",
  "Mendaur ulang 1 kaleng aluminium menghemat energi untuk menyalakan TV selama 3 jam nonstop.",
  "Indonesia tercatat sebagai salah satu penyumbang food waste terbesar di dunia!",
  "Sekitar 80% sampah plastik di lautan berasal dari daratan yang tak dikelola dengan baik.",
  "Popok bayi sekali pakai membutuhkan waktu sekitar 500 tahun untuk terurai di tanah.",
  "Baterai kancing sekecil koin yang bocor bisa mencemari hingga 600.000 liter air tanah.",
  "Industri fast fashion menyumbang emisi karbon lebih besar daripada penerbangan internasional.",
];

const QUIZ = [
  { q: "Ke mana kulit pisang harus dibuang?", a: "Tong Hijau (Organik). Bisa langsung masuk komposter!", correct: true },
  { q: "Gelas kopi kertas (paper cup) masuk ke tong kertas?", a: "Salah! Paper cup punya lapisan plastik di dalamnya. Biasanya masuk ke residu.", correct: false },
  { q: "Botol sampo bekas berbahan plastik tebal masuk ke mana?", a: "Tong Kuning (Plastik). Bilas sedikit air di dalamnya sebelum dibuang.", correct: true },
  { q: "Baterai jam tangan yang mati dibuang ke tong kuning?", a: "Salah! Baterai adalah sampah B3. Kumpulkan khusus di wadah tertutup (Merah).", correct: false },
  { q: "Kantong kresek basah kena kuah bakso?", a: "Masuk tong residu, karena sudah terkontaminasi minyak dan bau.", correct: false },
];

const FAQS = [
  { q: "Apakah semua plastik pasti bisa didaur ulang?", a: "Tidak semua. Plastik botol air (PET) sangat laku didaur ulang. Tapi plastik sachet, styrofoam, dan sedotan sangat sulit didaur ulang karena nilainya rendah. Kurangi penggunaannya!" },
  { q: "Bagaimana cara membuang minyak jelantah?", a: "Jangan pernah buang minyak jelantah ke wastafel karena bisa menyumbat pipa! Kumpulkan di botol tertutup dan setorkan ke lembaga pengelola jelantah (bisa ditukar uang lho)." },
  { q: "Gimana kalau setelah dipilah, disatukan lagi oleh petugas sampah?", a: "Triknya: berikan kantong berisi botol plastik, kardus, dan kaleng secara terpisah langsung ke petugas atau pemulung keliling. Mereka pasti senang dan tidak akan menyatukannya ke truk!" },
  { q: "Apakah saya perlu mencuci sampah plastik pakai sabun?", a: "Tidak perlu sampai bersih total layaknya cuci piring. Cukup dibilas kilat dengan air untuk menghilangkan sisa lemak/gula agar tidak bau saat disimpan." },
  { q: "Apa bedanya sampah organik dan residu?", a: "Organik adalah yang bisa membusuk alami (sayur, daging, daun). Residu adalah sampah yang sulit didaur ulang, tidak laku, dan tidak membusuk (popok bayi, sachet kotor, styrofoam)." },
  { q: "Mulai dari mana kalau saya masih pemula banget?", a: "Mulai dari yang paling gampang: sediakan 1 kresek tambahan khusus menampung botol plastik dan kardus. Sisanya buang seperti biasa. Konsisten 1 bulan, baru lanjut belajar memilah organik!" },
];

function InteractiveQuiz() {
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {QUIZ.map((item, idx) => (
        <div 
          key={idx} 
          onClick={() => setRevealed(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
          className="bg-white border-2 border-emerald-50 rounded-2xl p-6 cursor-pointer hover:border-emerald-200 transition shadow-sm"
        >
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">Q</div>
            <div className="flex-1">
              <p className="font-bold text-on-surface mb-2">{item.q}</p>
              {revealed.includes(idx) ? (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800 flex gap-2 animate-in fade-in slide-in-from-top-2">
                  {item.correct ? <CheckCircle2 className="text-emerald-600 shrink-0" size={18}/> : <XCircle className="text-red-500 shrink-0" size={18}/>}
                  <span>{item.a}</span>
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 opacity-70">Klik untuk melihat jawaban <ChevronDown size={14} /></p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DailyChecklist() {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    "Sediakan minimal 2 tempat sampah di dapur (1 untuk basah, 1 kering).",
    "Habiskan makanan di piring untuk mencegah food waste.",
    "Bilas sisa sabun, bumbu, atau minyak dari botol dan kaleng.",
    "Lipat atau sobek kardus belanjaan online agar hemat tempat.",
    "Sediakan 1 toples kecil khusus untuk mengumpulkan limbah B3.",
    "Ingatkan anggota keluarga lain di rumah kalau salah buang sampah!"
  ];

  return (
    <div className="bg-white border-2 border-surface-container rounded-3xl p-8 shadow-sm">
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isChecked = checked.includes(idx);
          return (
            <div 
              key={idx} 
              onClick={() => setChecked(prev => isChecked ? prev.filter(i => i !== idx) : [...prev, idx])}
              className={`flex gap-4 items-center p-4 rounded-xl cursor-pointer transition ${isChecked ? 'bg-surface-container-low opacity-60' : 'hover:bg-surface-container-low'}`}
            >
              <div className={`shrink-0 ${isChecked ? 'text-primary' : 'text-secondary'}`}>
                {isChecked ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <span className={`flex-1 text-on-surface font-medium transition-all ${isChecked ? 'line-through text-secondary' : ''}`}>
                {item}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-8 text-center text-sm font-bold text-primary">
        Progress: {checked.length} / {items.length} Selesai 🌿
      </div>
    </div>
  )
}

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className={`border-2 rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-primary bg-white shadow-md' : 'border-surface-container bg-surface-container-low hover:border-primary/30'}`}>
            <button onClick={() => setOpenIdx(isOpen ? null : idx)} className="w-full text-left p-6 flex justify-between items-center gap-4">
              <span className="font-bold text-on-surface">{faq.q}</span>
              <ChevronDown className={`shrink-0 text-secondary transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} size={20} />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-0 text-secondary leading-relaxed text-sm animate-in fade-in slide-in-from-top-2">
                {faq.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PanduanMemilahSampahPage() {
  const colorMap: Record<string, string> = {
    green: "text-green-600 bg-green-100 border-green-200",
    yellow: "text-yellow-600 bg-yellow-100 border-yellow-200",
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    gray: "text-gray-600 bg-gray-100 border-gray-200",
    red: "text-red-600 bg-red-100 border-red-200",
    orange: "text-orange-600 bg-orange-100 border-orange-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#0B1B15] text-white pt-12 pb-32 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} />
                Kembali ke Pusat Edukasi
              </Link>
            </div>

            {/* Header Content */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm tracking-wide mb-8 uppercase">
                <Leaf size={16} /> Edukasi Lingkungan
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Mulai dari Rumah,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-500">Selamatkan Bumi.</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Memilah sampah nggak harus ribet. Langkah kecilmu di dapur hari ini adalah nafas baru untuk masa depan lingkungan kita.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 gap-2">
                Mulai Belajar Memilah <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Reason Cards */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-surface-container">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="font-extrabold text-on-surface mb-2">{r.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis-Jenis Sampah */}
        <section className="py-20 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">6 Jenis Sampah di Rumah</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Kenali karakternya, siapkan tong yang tepat, dan pilah dengan benar.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {WASTE_TYPES.map((w, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-3xl p-8 border border-surface-container hover:shadow-md transition">
                  <div className="flex gap-6 items-start">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border ${colorMap[w.color]}`}>
                      {w.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-on-surface mb-2">{w.title}</h3>
                      <p className="text-secondary leading-relaxed mb-4 text-sm">{w.desc}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex gap-2">
                          <span className="font-bold text-on-surface text-sm shrink-0">Contoh:</span>
                          <span className="text-secondary text-sm">{w.examples}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-surface-container flex gap-3 items-start shadow-sm">
                        <Lightbulb className="text-yellow-500 shrink-0" size={18} />
                        <span className="text-sm font-medium text-on-surface leading-relaxed">{w.tips}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8 Kesalahan Umum */}
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-[3rem] p-8 md:p-16 text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">8 Kesalahan yang Sering Dilakukan</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto text-lg">Mungkin kamu pernah melakukan salah satunya tanpa sadar. Yuk, perbaiki mulai hari ini.</p>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {MISTAKES.map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex gap-3 items-start mb-3">
                      <XCircle className="text-red-400 shrink-0 mt-1" size={20} />
                      <p className="font-medium text-gray-200 line-through decoration-red-500/50">{m.wrong}</p>
                    </div>
                    <div className="flex gap-3 items-start ml-2 pl-6 border-l-2 border-emerald-500/30">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={20} />
                      <p className="text-sm text-gray-300 leading-relaxed font-bold">{m.right}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fakta Menarik (Horizontal Scroll) */}
        <section className="py-10 overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6 mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-2">Tahukah Kamu?</h2>
              <p className="text-secondary">Fakta mencengangkan seputar sampah kita.</p>
            </div>
            <Zap className="text-yellow-500" size={32} />
          </div>
          <div className="flex overflow-x-auto pb-8 pt-4 px-6 gap-6 snap-x snap-mandatory hide-scrollbar max-w-[1200px] mx-auto">
            {FACTS.map((f, i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-white border border-surface-container rounded-3xl p-8 shadow-sm flex flex-col justify-center min-h-[200px]">
                <div className="text-4xl font-black text-primary/10 mb-4">#{i+1}</div>
                <p className="text-on-surface font-bold leading-relaxed text-lg">{f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz & Checklist */}
        <section className="py-20 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-extrabold text-on-surface mb-4">Kuis: Kamu Udah Jago Belum?</h2>
                <p className="text-secondary mb-8">Tebak ke tong mana sampah ini harus dibuang. Klik kartu untuk melihat jawaban!</p>
                <InteractiveQuiz />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-on-surface mb-4">Checklist Harian</h2>
                <p className="text-secondary mb-8">Centang tugas harianmu agar terbiasa memilah sampah.</p>
                <DailyChecklist />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Pertanyaan Seputar Sampah</h2>
              <p className="text-secondary text-lg">Yang sering bikin bingung para pemula.</p>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* Call to Action Box */}
        <section className="pb-32 pt-10">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">Langkah Selanjutnya?</h3>
              <p className="text-emerald-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
                Memilah sampah dari rumah ternyata gampang banget, kan? Setelah jago memilah, yuk tingkatkan *skill* kamu dengan belajar cara mengubah sisa makanan menjadi pupuk kompos yang menyuburkan tanaman!
              </p>
              
              <div className="flex justify-center relative z-10">
                <Link href="/edukasi/cara-membuat-kompos" className="inline-flex items-center justify-center bg-white text-[#064E3B] font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 hover:-translate-y-1 transition-all shadow-lg">
                  Cara Membuat Kompos
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
