"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, ChevronDown, DollarSign, Package, Beaker, Recycle, Droplet,
  Globe, ShieldAlert, Banknote, Lightbulb, CheckCircle2, XCircle, Zap,
  CheckSquare, Square, ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <Banknote size={24} />, title: "Tambahan Penghasilan", desc: "Dari pada dibuang dan jadi masalah, lebih baik ditukar jadi uang jajan tambahan.", color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
  { icon: <Globe size={24} />, title: "Dukung Ekonomi Sirkular", desc: "Kamu membantu industri daur ulang mendapatkan bahan baku lokal tanpa harus impor.", color: "text-blue-600 bg-blue-100 border-blue-200" },
  { icon: <Recycle size={24} />, title: "Kurangi Beban TPA", desc: "Sampah anorganik memakan tempat sangat besar di TPA. Menjualnya memperpanjang umur TPA.", color: "text-green-600 bg-green-100 border-green-200" },
  { icon: <ShieldAlert size={24} />, title: "Pahlawan Lingkungan", desc: "Mencegah plastik dan minyak jelantah mencemari air tanah dan laut kita.", color: "text-yellow-600 bg-yellow-100 border-yellow-200" },
];

const PRICES = [
  { 
    icon: <Package size={28} />, title: "Kardus Bekas", price: "Rp 1.500 - 2.500 / kg", color: "amber",
    desc: "Kardus tebal, kotak sepatu, karton box packing. Sangat diminati pabrik kertas daur ulang.",
    examples: "Kardus mie instan, kardus TV, kotak paket.",
    tips: "Pastikan kering, tidak berminyak, dan lipat pipih agar hemat tempat penyimpanan."
  },
  { 
    icon: <Beaker size={28} />, title: "Plastik PET (Botol)", price: "Rp 2.000 - 4.500 / kg", color: "blue",
    desc: "Botol air mineral jernih. Material ini paling mudah didaur ulang menjadi polyester atau botol baru.",
    examples: "Botol air mineral, botol minuman soda bening.",
    tips: "Harga lebih mahal jika botol dalam keadaan bersih, diremas, dan tutup serta label plastiknya dilepas."
  },
  { 
    icon: <Recycle size={28} />, title: "Plastik PP (Gelas)", price: "Rp 3.000 - 6.000 / kg", color: "green",
    desc: "Plastik transparan yang biasa dipakai untuk gelas minuman boba atau kopi kekinian.",
    examples: "Gelas plastik minuman, kotak makan plastik bening.",
    tips: "Wajib dibilas bersih! Gelas yang masih ada sisa manis-manis akan ditolak karena mengundang semut."
  },
  { 
    icon: <Droplet size={28} />, title: "Minyak Jelantah", price: "Rp 3.000 - 7.000 / liter", color: "yellow",
    desc: "Minyak sisa menggoreng yang sudah tidak layak pakai. Diolah kembali menjadi bahan bakar Biodiesel.",
    examples: "Minyak bekas goreng ikan, ayam, atau tempe.",
    tips: "Saring sisa makanan yang gosong, lalu simpan minyak di jerigen tertutup agar tidak tumpah."
  },
  { 
    icon: <DollarSign size={28} />, title: "Besi & Logam", price: "Rp 4.000 - 15.000 / kg", color: "gray",
    desc: "Barang keras bernilai tinggi. Harga aluminium biasanya jauh lebih mahal dibanding besi biasa.",
    examples: "Kaleng minuman soda, paku, seng bekas, wajan bocor.",
    tips: "Kaleng aluminium sangat ringan, jadi butuh banyak untuk mencapai 1 kg. Hati-hati dengan tepi tajam!"
  },
  { 
    icon: <DollarSign size={28} />, title: "Buku & HVS", price: "Rp 1.500 - 3.000 / kg", color: "emerald",
    desc: "Kertas tulis kualitas tinggi. HVS putih bersih memiliki nilai jual paling tinggi di kategori kertas.",
    examples: "Buku pelajaran lama, kertas fotokopian, koran.",
    tips: "Pisahkan antara HVS putih, koran, dan kertas buram karena harganya berbeda-beda."
  },
];

const MISTAKES = [
  { wrong: "Membiarkan sisa minuman manis di botol plastik.", right: "Selalu bilas kilat dengan air. Botol bersemut atau lengket harganya akan dipotong drastis." },
  { wrong: "Menyatukan semua jenis plastik dalam satu karung.", right: "Pengepul menghargai lebih tinggi jika kamu sudah memisahkan PET (botol), PP (gelas), dan kresek." },
  { wrong: "Menjual kardus yang basah kehujanan atau berminyak.", right: "Kertas berminyak/basah akan berjamur dan ditolak pabrik. Jaga tetap kering." },
  { wrong: "Membuang minyak jelantah ke selokan atau wastafel.", right: "Bisa menyumbat pipa dan mencemari air! Saring dan simpan di jerigen untuk dijual." },
  { wrong: "Mencampur tutup botol dengan badan botol PET.", right: "Beda jenis plastik! Tutupnya (HDPE) harganya beda dengan badan botol (PET). Pisahkan!" },
  { wrong: "Terlalu lama menimbun sampah hingga berbau busuk.", right: "Rutin jadwalkan penyetoran maksimal sebulan sekali agar rumah tetap bersih." },
];

const FACTS = [
  "Pasar daur ulang plastik di Indonesia bernilai triliunan rupiah setiap tahunnya.",
  "1 liter minyak jelantah yang dibuang sembarangan bisa mencemari 1000 liter air bersih.",
  "Membuat aluminium baru butuh 95% energi LEBIH BANYAK dibanding mendaur ulang kaleng bekas.",
  "Banyak pahlawan lingkungan (pemulung) yang menggantungkan hidup 100% dari nilai jual sampah.",
  "Pabrik kertas daur ulang sangat kelaparan bahan baku kardus di era belanja online saat ini.",
  "Minyak jelantah dari Indonesia banyak diekspor ke Eropa untuk dijadikan avtur (bahan bakar pesawat).",
];

const FAQS = [
  { q: "Apakah harga sampah selalu sama setiap hari?", a: "Tidak. Harga fluktuatif mengikuti harga pasar komoditas global, mirip seperti harga minyak kelapa sawit atau emas namun dalam skala mikro." },
  { q: "Gimana cara termudah menemukan pengepul atau Bank Sampah?", a: "Tanya Pak RT/RW, cari 'Bank Sampah' di Google Maps, atau tunggu tukang rongsok keliling yang lewat depan rumahmu." },
  { q: "Apakah saya harus bawa timbangan sendiri?", a: "Biasanya Bank Sampah atau pengepul sudah punya timbangan yang akurat. Tapi kalau mau punya timbangan gantung digital kecil di rumah buat estimasi, itu lebih bagus!" },
  { q: "Sampah kresek laku dijual nggak sih?", a: "Sangat murah, bahkan kadang tidak diterima karena ongkos daur ulangnya mahal dibanding nilai jualnya. Lebih baik kurangi pemakaian kresek dari awal." },
  { q: "Kenapa kardus pizza bekas nggak laku?", a: "Karena bagian yang kena minyak dan saus sudah terkontaminasi. Mesin pembuat bubur kertas tidak bisa memisahkan minyak dari serat kertas." },
];

export default function NilaiJualSampahPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [checked, setChecked] = useState<number[]>([]);

  const colorMap: Record<string, string> = {
    amber: "text-amber-600 bg-amber-100 border-amber-200",
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    green: "text-green-600 bg-green-100 border-green-200",
    yellow: "text-yellow-600 bg-yellow-100 border-yellow-200",
    gray: "text-gray-600 bg-gray-100 border-gray-200",
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
  };

  const checklistItems = [
    "Sediakan karung/kardus terpisah untuk barang rongsok.",
    "Bilas botol dan gelas plastik sehabis dipakai.",
    "Pisahkan kertas HVS putih dari kertas buram/koran.",
    "Sediakan corong dan jerigen khusus untuk jelantah.",
    "Lipat rapi kardus paket sebelum disimpan.",
    "Cari tahu lokasi Bank Sampah terdekat via Google Maps."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#0B2516] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm tracking-wide mb-8 uppercase">
                <Banknote size={16} /> Ekonomi Sirkular
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Ubah Sampah,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-500">Jadi Cuan Sampingan.</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Jangan buru-buru dibuang! Banyak barang bekas di rumahmu yang dicari-cari oleh pabrik daur ulang. Kenali jenisnya dan mulai kumpulkan.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 gap-2">
                Lihat Daftar Harga <ArrowRight size={18} />
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

        {/* Daftar Harga Section */}
        <section className="py-20 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Estimasi Harga Jual (Per Kg)</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Harga bisa berbeda di tiap daerah dan Bank Sampah, namun ini adalah kisaran rata-ratanya.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {PRICES.map((w, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-3xl p-8 border border-surface-container hover:shadow-md transition">
                  <div className="flex gap-6 items-start">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border ${colorMap[w.color]}`}>
                      {w.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-on-surface mb-1">{w.title}</h3>
                      <div className="text-primary font-black text-xl mb-3">{w.price}</div>
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

        {/* Kesalahan Umum */}
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-[3rem] p-8 md:p-16 text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">6 Kesalahan Saat Menjual Sampah</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto text-lg">Jangan biarkan nilai jual sampahmu anjlok karena kesalahan sepele ini.</p>
              
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

        {/* Fakta Menarik */}
        <section className="py-10 overflow-hidden">
          <div className="max-w-[1000px] mx-auto px-6 mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-2">Fakta Ekonomi Daur Ulang</h2>
              <p className="text-secondary">Ternyata sampah adalah harta karun industri.</p>
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

        {/* Checklist */}
        <section className="py-20 bg-white border-y border-surface-container">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-on-surface mb-4 text-center">Persiapan Membuka "Lapak" di Rumah</h2>
            <p className="text-secondary mb-10 text-center">Centang jika kamu sudah menyiapkan hal-hal ini.</p>
            
            <div className="bg-white border-2 border-surface-container rounded-3xl p-8 shadow-sm">
              <div className="space-y-4">
                {checklistItems.map((item, idx) => {
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
                Kesiapan: {checked.length} / {checklistItems.length} Selesai 💰
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Pertanyaan Populer</h2>
              <p className="text-secondary text-lg">Bingung mulai dari mana? Temukan jawabannya di sini.</p>
            </div>
            
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
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
