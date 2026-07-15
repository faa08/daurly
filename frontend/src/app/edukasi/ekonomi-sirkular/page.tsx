"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, ArrowRight, X, Plus, CheckSquare, Square, Zap,
  TrendingDown, RefreshCw, Hand, Heart, Scissors,
  Package, HelpCircle, Droplet, TreePine, Recycle, Globe,
  ArrowDownToLine, HandMetal
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONCEPT_5R = [
  { icon: <HandMetal size={28} />, title: "Refuse", desc: "Tolak kantong plastik atau sedotan saat belanja.", color: "bg-rose-100 text-rose-600 border-rose-200" },
  { icon: <TrendingDown size={28} />, title: "Reduce", desc: "Beli yang benar-benar kamu butuhkan, bukan sekadar keinginan.", color: "bg-orange-100 text-orange-600 border-orange-200" },
  { icon: <RefreshCw size={28} />, title: "Reuse", desc: "Gunakan barang berulang kali (botol minum, tote bag).", color: "bg-blue-100 text-blue-600 border-blue-200" },
  { icon: <Scissors size={28} />, title: "Repurpose", desc: "Sulap baju bekas jadi tas belanja atau kaleng jadi pot.", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { icon: <Recycle size={28} />, title: "Recycle", desc: "Ubah botol plastik jadi biji plastik untuk barang baru.", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
];

const REASONS = [
  { icon: <TreePine size={32} />, title: "Menyelamatkan Hutan & Habitat", desc: "Dengan menggunakan material yang ada, kita tidak perlu menebang pohon baru atau menambang bumi.", color: "from-emerald-50 to-teal-50 border-teal-100 text-teal-800" },
  { icon: <Droplet size={32} />, title: "Mencegah Polusi", desc: "Daur ulang mengonsumsi energi jauh lebih sedikit dan menghasilkan emisi yang sangat rendah.", color: "from-blue-50 to-cyan-50 border-cyan-100 text-cyan-800" },
  { icon: <Heart size={32} />, title: "Mendukung Pengrajin", desc: "Setiap produk daur ulang yang kamu beli menghidupi para seniman lokal dan pahlawan lingkungan.", color: "from-rose-50 to-pink-50 border-pink-100 text-pink-800" },
];

const FACTS = [
  "Ekonomi Sirkular berpotensi mengurangi emisi gas rumah kaca global hingga 39%!",
  "Di alam liar, tidak ada istilah 'sampah'. Daun gugur akan jadi makanan. Inilah inspirasi Sirkular.",
  "Baju dari bahan daur ulang (rPET) menghemat air hingga ribuan liter dibanding baju katun baru.",
  "Sampah elektronik mengandung emas & perak yang 100% bisa diekstrak dan dipakai lagi.",
  "Model bisnis sewa atau thrift shop adalah contoh nyata Ekonomi Sirkular.",
  "Memperbaiki HP rusak (tanpa beli baru) menghemat sekitar 80kg emisi karbon.",
  "Di Swedia, kurang dari 1% sampah rumah tangga yang berakhir di TPA. Sisanya didaur ulang!",
  "Membeli 1 tas upcycle dari ban bekas sama dengan menyelamatkan lautan dari mikroplastik mematikan.",
];

const FAQS = [
  { q: "Apa bedanya Recycle (Daur Ulang) dan Upcycle?", a: "Recycle menghancurkan material (misal plastik dilelehkan) untuk barang baru. Upcycle mengambil barang bekas dan memberinya fungsi baru yang bernilai seni lebih tinggi tanpa menghancurkannya (misal ban jadi kursi)." },
  { q: "Apakah barang hasil upcycle awet?", a: "Sangat awet! Apalagi jika material asalnya kayu jati bekas kapal, terpal truk, atau ban karet. Kekuatannya sering mengalahkan barang pabrikan massal." },
  { q: "Kenapa produk upcycle kadang harganya mahal?", a: "Karena setiap produk dibuat secara handmade, unik (tidak ada duanya), dan melalui proses pembersihan material yang rumit. Kamu membeli karya seni & nilai lingkungan." },
  { q: "Apakah saya harus hidup Zero Waste 100%?", a: "Tentu tidak. Mulailah dari langkah sekecil mungkin. Membawa tas belanja sendiri saja sudah merupakan kontribusi luar biasa!" },
];

function InteractiveChecklist() {
  const [checked, setChecked] = useState<number[]>([]);
  const items = [
    { title: "Beli Produk Upcycle", desc: "Pilih barang buatan pengrajin lokal yang memanfaatkan material sisa." },
    { title: "Mulai Memilah Sampah", desc: "Pisahkan kertas, plastik, kaca, dan organik di rumahmu sekarang juga." },
    { title: "Beli Barang Pre-loved", desc: "Jelajahi thrift shop atau barang second-hand alih-alih beli baru." },
    { title: "Perbaiki, Jangan Dibuang", desc: "Jahit baju yang robek sedikit atau servis alat elektronik yang mati." }
  ];

  return (
    <div className="bg-white border border-indigo-100 rounded-[2rem] p-8 shadow-sm">
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isChecked = checked.includes(idx);
          return (
            <div 
              key={idx} 
              onClick={() => setChecked(prev => isChecked ? prev.filter(i => i !== idx) : [...prev, idx])}
              className={`flex gap-5 items-start p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${isChecked ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-surface-container hover:border-indigo-300'}`}
            >
              <div className={`shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-indigo-600' : 'text-gray-400'}`}>
                {isChecked ? <CheckSquare size={28} /> : <Square size={28} />}
              </div>
              <div>
                <h4 className={`font-bold text-lg mb-1 transition-all ${isChecked ? 'text-indigo-900 line-through opacity-70' : 'text-on-surface'}`}>{item.title}</h4>
                <p className={`text-sm transition-all ${isChecked ? 'text-indigo-700/60' : 'text-secondary'}`}>{item.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-8 pt-6 border-t border-indigo-100 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm">
          Aksi Selesai: {checked.length} / {items.length} 🌍
        </div>
      </div>
    </div>
  )
}

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-4">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#4F46E5] shadow-lg shadow-indigo-900/5' : 'border-surface-container bg-white hover:border-[#4F46E5]/30'}`}>
            <button onClick={() => setOpenIdx(isOpen ? null : idx)} className="w-full text-left p-6 flex justify-between items-center gap-4 bg-white">
              <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-[#4F46E5]' : 'text-on-surface'}`}>{faq.q}</span>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-100 text-[#4F46E5]' : 'bg-surface-container-low text-secondary'}`}>
                {isOpen ? <X size={20} /> : <Plus size={20} />}
              </div>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-2 text-secondary leading-relaxed bg-white text-lg">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function EkonomiSirkularPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#0F172A] text-white pt-12 pb-32 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4F46E5]/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0EA5E9]/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-white transition group bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-sm tracking-widest mb-8 uppercase">
                <Recycle size={16} /> Misi Masa Depan
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Menutup Siklus,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] to-[#38BDF8]">Menyelamatkan Bumi.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
                Tinggalkan gaya hidup kuno "Beli, Pakai, Buang". Mari beralih ke sistem di mana tidak ada barang yang berujung menjadi sampah, dan setiap material memiliki kehidupan kedua.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-[#4F46E5] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#4338CA] hover:-translate-y-1 transition-all shadow-xl shadow-indigo-900/30 gap-2">
                Pelajari Konsepnya <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Linear vs Sirkular */}
        <section className="py-20 -mt-16 relative z-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Linear */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-xl shadow-slate-900/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowDownToLine size={150} />
                </div>
                <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 font-bold text-sm rounded-full mb-6 uppercase tracking-wider">
                  Masa Lalu
                </div>
                <h2 className="text-3xl font-extrabold text-on-surface mb-6">Ekonomi Linear</h2>
                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm mb-8 flex-wrap">
                  <span className="bg-slate-100 px-3 py-1 rounded-md">Ambil</span> ➔
                  <span className="bg-slate-100 px-3 py-1 rounded-md">Buat</span> ➔
                  <span className="bg-slate-100 px-3 py-1 rounded-md">Pakai</span> ➔
                  <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-md">Buang</span>
                </div>
                <p className="text-secondary leading-relaxed">
                  <strong>Dampak:</strong> Sumber daya alam habis terkuras dan lautan penuh dengan tumpukan sampah yang tidak terurai. Pola pikir yang menghancurkan planet.
                </p>
              </div>

              {/* Sirkular */}
              <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0F2FE] rounded-[2.5rem] p-10 border border-indigo-100 shadow-xl shadow-indigo-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <RefreshCw size={150} className="text-indigo-500" />
                </div>
                <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white font-bold text-sm rounded-full mb-6 uppercase tracking-wider">
                  Masa Depan
                </div>
                <h2 className="text-3xl font-extrabold text-indigo-950 mb-6">Ekonomi Sirkular</h2>
                <div className="flex items-center gap-2 text-indigo-800 font-medium text-sm mb-8 flex-wrap">
                  <span className="bg-white/50 border border-indigo-200 px-3 py-1 rounded-md">Desain</span> ➔
                  <span className="bg-white/50 border border-indigo-200 px-3 py-1 rounded-md">Pakai</span> ➔
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md">Daur Ulang</span> ➔
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-md">Kembali ke Awal</span>
                </div>
                <p className="text-indigo-900/80 leading-relaxed">
                  <strong>Dampak:</strong> Nol sampah (Zero Waste). Alam punya waktu untuk bernapas dan memulihkan diri. Nilai ekonomi material terus berputar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Konsep 5R */}
        <section className="py-24 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Konsep 5R: Senjata Utama Kita</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Bukan cuma soal mendaur ulang botol plastik. Ini adalah gaya hidup.</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {CONCEPT_5R.map((item, i) => (
                <div key={i} className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1rem)] min-w-[200px] group">
                  <div className={`h-full border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.color} bg-opacity-30`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm`}>
                      {item.icon}
                    </div>
                    <h3 className="font-black text-xl mb-3 text-on-surface">{i+1}. {item.title}</h3>
                    <p className="text-sm text-secondary font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kenapa Peduli */}
        <section className="py-24">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Mengapa Kita Harus Peduli?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {REASONS.map((r, i) => (
                <div key={i} className={`bg-gradient-to-b ${r.color} border rounded-[2rem] p-8 text-center hover:shadow-lg transition-shadow`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    {r.icon}
                  </div>
                  <h3 className="text-xl font-extrabold mb-4">{r.title}</h3>
                  <p className="opacity-80 leading-relaxed text-sm font-medium">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fakta Menarik */}
        <section className="py-20 bg-[#0F172A] text-white overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6 mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold mb-2">Fakta Mencengangkan</h2>
              <p className="text-slate-400">Hal-hal yang mungkin belum kamu tahu.</p>
            </div>
            <Globe className="text-indigo-400" size={40} />
          </div>
          <div className="flex overflow-x-auto pb-12 pt-4 px-6 gap-6 snap-x snap-mandatory hide-scrollbar max-w-[1200px] mx-auto">
            {FACTS.map((f, i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-xl flex flex-col justify-center min-h-[220px] hover:border-indigo-500 transition-colors">
                <div className="text-5xl font-black text-slate-700 mb-4">#{i+1}</div>
                <p className="text-slate-200 font-medium leading-relaxed text-lg">{f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Aksi & FAQ */}
        <section className="py-24 bg-white">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16">
              
              <div>
                <h2 className="text-3xl font-extrabold text-on-surface mb-4">Gimana Cara Mulainya?</h2>
                <p className="text-secondary mb-10">Centang hal-hal yang sudah mulai kamu terapkan hari ini.</p>
                <InteractiveChecklist />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-on-surface mb-4">Tanya Jawab (FAQ)</h2>
                <p className="text-secondary mb-10">Pertanyaan umum seputar ekonomi sirkular.</p>
                <FAQAccordion />
              </div>

            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="pb-32 pt-10">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#2563EB] rounded-[3rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10 leading-tight">Jadilah Bagian dari Solusi!</h3>
              <p className="text-indigo-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed relative z-10 font-light">
                Tidak perlu menunggu orang lain untuk mengubah dunia. Setiap keputusan belanjamu memiliki kekuatan besar untuk membentuk masa depan bumi yang lebih hijau.
              </p>
              
              <div className="flex justify-center relative z-10">
                <Link href="/kategori" className="inline-flex items-center justify-center bg-white text-indigo-700 font-bold px-10 py-5 rounded-2xl hover:bg-indigo-50 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-900/20 text-lg">
                  Jelajahi Produk Upcycle Daurly
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
