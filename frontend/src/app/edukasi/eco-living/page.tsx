"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Leaf, ShoppingBag, Droplet, Coffee, 
  CheckSquare, Square, CheckCircle2, XCircle, Heart, Star, 
  Sun, BatteryCharging, ArrowRight, Lightbulb
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TIPS = [
  { icon: <ShoppingBag size={28} />, title: "Tolak Kantong Kresek", desc: "Satu kantong kresek rata-rata hanya dipakai selama 12 menit, tapi butuh 500 tahun untuk terurai di alam. Bawa totebag lipatmu kemanapun.", color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
  { icon: <Droplet size={28} />, title: "Bawa Tumbler Kesayangan", desc: "Berhenti membeli air mineral botol plastik. Selain mengurangi sampah, kamu bisa berhemat hingga ratusan ribu rupiah per bulan.", color: "text-blue-600 bg-blue-100 border-blue-200" },
  { icon: <Coffee size={28} />, title: "Ucapkan Selamat Tinggal Sedotan", desc: "Minumlah langsung dari gelas saat di kafe. Jika sangat butuh, investasikan pada sedotan stainless, bambu, atau kaca.", color: "text-amber-600 bg-amber-100 border-amber-200" },
  { icon: <Heart size={28} />, title: "Habiskan Makananmu (Zero Food Waste)", desc: "Ambil makanan secukupnya. Sisa makanan yang membusuk di TPA menghasilkan gas metana penyebab efek rumah kaca ekstrem.", color: "text-rose-600 bg-rose-100 border-rose-200" },
];

const STARTER_PACK = [
  { name: "Totebag Lipat Parasut", desc: "Kecil saat dilipat, sangat kuat menahan beban belanja bulanan." },
  { name: "Tumbler Stainless Steel", desc: "Menjaga air tetap dingin atau panas berjam-jam. Awet bertahun-tahun." },
  { name: "Kotak Bekal Silikon (Collapsible)", desc: "Bisa dilipat pipih saat tidak dipakai, sangat praktis untuk jajan boba/makanan." },
  { name: "Set Sendok & Sedotan Stainless", desc: "Bawa dalam tas kecil, tolak semua alat makan sekali pakai saat beli makan di luar." }
];

const MISTAKES = [
  { wrong: "Membeli banyak botol kaca mahal untuk ikut tren eco-living.", right: "Gunakan botol sirup atau toples selai kaca bekas yang ada di dapurmu. Upcycle adalah kunci utama eco-living!" },
  { wrong: "Membuang semua wadah plastik lama (Tupperware, dll) karena ingin beralih ke kaca.", right: "Jangan dibuang! Tetap gunakan wadah plastik yang sudah ada sampai rusak. Membuang barang bagus justru menciptakan sampah baru." },
  { wrong: "Membeli totebag katun setiap kali lupa bawa kantong belanja.", right: "Produksi kapas untuk totebag butuh SANGAT BANYAK air. Gunakan 1-2 totebag secara konsisten bertahun-tahun." },
  { wrong: "Mencoba mengubah semua kebiasaan secara drastis dalam satu hari.", right: "Mulai pelan-pelan! Pilih 1 kebiasaan dulu (misal: bawa tumbler), jika sudah konsisten 1 bulan, tambah kebiasaan lain." },
];

export default function EcoLivingPage() {
  const [checked, setChecked] = useState<number[]>([]);

  const checklistItems = [
    "Hari 1: Saya menolak sedotan plastik hari ini.",
    "Hari 2: Saya membawa tumbler dan tidak beli air kemasan botol.",
    "Hari 3: Saya menghabiskan piring makan malam tanpa sisa (zero waste).",
    "Hari 4: Saya membawa kantong kain saat jajan/belanja ke minimarket.",
    "Hari 5: Saya mencabut colokan listrik charger yang tidak terpakai.",
    "Hari 6: Saya mengganti tisu wajah dengan sapu tangan kain (jika memungkinkan).",
    "Hari 7: Saya berhasil mandi hemat air (mematikan kran saat sabunan)."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#022C22] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-sm tracking-wide mb-8 uppercase">
                <Leaf size={16} /> Gaya Hidup Hijau
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Mulai Gaya Hidup <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">Eco-Living.</span>
              </h1>
              <p className="text-lg md:text-xl text-teal-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Langkah terkecil sekalipun bermakna besar. Tidak perlu sempurna, yang penting kita mulai mengambil tindakan sadar setiap harinya.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 gap-2">
                Pelajari 4 Pilar Utama <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pilar Eco Living */}
        <section className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            {TIPS.map((item, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-teal-900/5 border border-surface-container flex gap-6 hover:shadow-2xl transition group">
                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-on-surface mb-3">{item.title}</h3>
                  <p className="text-secondary text-base leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Starter Pack Section */}
        <section className="py-20 bg-[#F0FDF4] border-y border-emerald-100">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] mb-6">
                  <Star size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#022C22] mb-4">Starter Pack Pemula</h2>
                <p className="text-emerald-800/80 leading-relaxed text-lg">Kamu tak perlu beli baru! Cari barang-barang ini di lemarimu dan jadikan senjata harian untuk menolak plastik.</p>
              </div>
              
              <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                {STARTER_PACK.map((sp, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-black mb-4">
                      {idx + 1}
                    </div>
                    <h3 className="font-extrabold text-on-surface mb-2">{sp.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{sp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Kesalahan Pemula */}
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#111827] to-[#0F172A] rounded-[3rem] p-8 md:p-16 text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">4 Jebakan "Greenwashing" Pemula</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto text-lg">Jangan sampai niat baikmu justru merusak lingkungan karena terjebak tren konsumerisme.</p>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {MISTAKES.map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex gap-3 items-start mb-3">
                      <XCircle className="text-red-400 shrink-0 mt-1" size={20} />
                      <p className="font-medium text-gray-300 line-through decoration-red-500/50">{m.wrong}</p>
                    </div>
                    <div className="flex gap-3 items-start ml-2 pl-6 border-l-2 border-teal-500/30">
                      <CheckCircle2 className="text-teal-400 shrink-0 mt-1" size={20} />
                      <p className="text-sm text-gray-200 leading-relaxed font-bold">{m.right}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7 Days Challenge */}
        <section className="py-20 bg-white border-t border-surface-container">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Tantangan 7 Hari Pertama</h2>
              <p className="text-secondary text-lg">Langkah kecil yang konsisten lebih baik daripada langkah besar namun hanya sesekali.</p>
            </div>
            
            <div className="bg-white border-2 border-surface-container rounded-3xl p-8 shadow-sm">
              <div className="space-y-4">
                {checklistItems.map((item, idx) => {
                  const isChecked = checked.includes(idx);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setChecked(prev => isChecked ? prev.filter(i => i !== idx) : [...prev, idx])}
                      className={`flex gap-4 items-center p-5 rounded-xl cursor-pointer transition border-2 ${isChecked ? 'bg-teal-50 border-teal-100' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`}
                    >
                      <div className={`shrink-0 ${isChecked ? 'text-teal-600' : 'text-gray-300'}`}>
                        {isChecked ? <CheckSquare size={28} /> : <Square size={28} />}
                      </div>
                      <span className={`flex-1 text-on-surface font-semibold transition-all ${isChecked ? 'line-through text-teal-700/60' : ''}`}>
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-10 bg-teal-600 text-white rounded-2xl p-6 text-center">
                <BatteryCharging className="mx-auto mb-3 opacity-80" size={32} />
                <h3 className="font-extrabold text-xl mb-1">Status Energi Hijaumu</h3>
                <p className="font-medium opacity-90">{checked.length} dari 7 hari telah diselesaikan!</p>
                {checked.length === 7 && (
                  <p className="mt-4 font-black text-yellow-300 animate-pulse">Luar Biasa! Kamu resmi menjadi Eco-Warrior! 🌍</p>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
