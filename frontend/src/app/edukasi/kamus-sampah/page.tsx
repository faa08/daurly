"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, CheckCircle2, XCircle, AlertTriangle, HelpCircle, 
  ChevronDown, Globe, BookOpen, FileQuestion, ArrowRight, Lightbulb
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <BookOpen size={24} />, title: "Mencegah Bencana Lingkungan", desc: "Satu baterai kecil di tong organik bisa mencemari ribuan liter air tanah di sekitarmu.", color: "text-blue-600 bg-blue-100 border-blue-200" },
  { icon: <Globe size={24} />, title: "Menyelamatkan Mesin Daur Ulang", desc: "Barang yang salah masuk bisa merusak pisau mesin pencacah di pabrik daur ulang plastik.", color: "text-green-600 bg-green-100 border-green-200" },
  { icon: <HelpCircle size={24} />, title: "Menghindari Bingung", desc: "Banyak produk kemasan membingungkan. Kamus ini akan memberimu jawaban instan yang akurat.", color: "text-amber-600 bg-amber-100 border-amber-200" },
  { icon: <Lightbulb size={24} />, title: "Meningkatkan Kesadaran", desc: "Tahu mana residu bikin kamu lebih bijak saat belanja (mengurangi membeli barang yang tak bisa didaur ulang).", color: "text-purple-600 bg-purple-100 border-purple-200" },
];

const DICTIONARY = [
  { name: "Sikat Gigi Plastik", type: "Residu", category: "residu", desc: "Sulit didaur ulang karena badannya plastik keras, namun bulunya nilon. Harus dipisahkan menggunakan mesin khusus.", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Kertas Struk Belanja", type: "Residu", category: "residu", desc: "Thermal paper mengandung BPA (bahan kimia beracun). Jangan buang ke tong kertas karena akan merusak bubur kertas daur ulang.", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Botol Kaca Sirup", type: "Daur Ulang", category: "daur-ulang", desc: "Bisa didaur ulang terus-menerus! Bilas bersih dan pisahkan tutup seng/plastiknya.", icon: <CheckCircle2 className="text-emerald-500" size={24} /> },
  { name: "Kotak Susu UHT / Tetra Pak", type: "Daur Ulang Khusus", category: "khusus", desc: "Terdiri dari lapisan kertas, plastik, dan aluminium. Kumpulkan bersih, lalu kirim ke drop-point khusus Tetra Pak.", icon: <AlertTriangle className="text-amber-500" size={24} /> },
  { name: "Puntung Rokok", type: "Residu", category: "residu", desc: "Filter rokok terbuat dari serat plastik cellulose acetate yang butuh 10 tahun untuk terurai. Sangat beracun bagi hewan air.", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Baterai AA / AAA", type: "Sampah B3", category: "b3", desc: "Limbah beracun! Jangan buang ke tong sampah biasa. Kumpulkan di toples dan serahkan ke pengelola e-waste.", icon: <AlertTriangle className="text-orange-500" size={24} /> },
  { name: "Kardus Pizza Beminyak", type: "Residu", category: "residu", desc: "Bagian yang kena saus/minyak tidak bisa didaur ulang. Gunting bagian bersihnya (bisa masuk kertas), sisanya buang ke residu.", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Kantung Teh Celup", type: "Organik & Residu", category: "residu", desc: "Kebanyakan kantung teh mengandung plastik seal. Gunting dan keluarkan tehnya (organik), buang bungkusnya (residu).", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Gabus / Styrofoam", type: "Residu", category: "residu", desc: "Terbuat dari 95% udara dan polistirena. Hampir tidak ada pengepul yang mau menerimanya. Tolak dari awal!", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Botol Sampo/Sabun", type: "Daur Ulang", category: "daur-ulang", desc: "Bahan HDPE (Kode 2) yang sangat laku. Bilas sisa sabun dengan air sebelum disetor ke Bank Sampah.", icon: <CheckCircle2 className="text-emerald-500" size={24} /> },
  { name: "Cermin Pecah", type: "Residu", category: "residu", desc: "Kaca cermin memiliki lapisan perak pemantul di belakangnya yang membuatnya tidak bisa didaur ulang bersama botol kaca bening.", icon: <XCircle className="text-red-500" size={24} /> },
  { name: "Tisu Bekas", type: "Residu", category: "residu", desc: "Serat kertas pada tisu terlalu pendek untuk didaur ulang lagi. Seringkali sudah kotor juga. Buang ke tong abu-abu (residu).", icon: <XCircle className="text-red-500" size={24} /> },
];

const FAQS = [
  { q: "Apa itu Residu?", a: "Residu adalah sampah 'mati'. Sampah ini sudah tidak bisa membusuk (non-organik) dan tidak laku atau sangat sulit didaur ulang, sehingga nasib akhirnya pasti ditumpuk di TPA atau dibakar (insinerator)." },
  { q: "Kenapa kertas struk ATM tidak boleh masuk ke tong kertas?", a: "Kertas struk (thermal paper) bukan diprint dengan tinta, melainkan dipanaskan dan mengandung BPA (Bisphenol A). Jika tercampur, ia akan mencemari bubur kertas daur ulang dan membuatnya beracun." },
  { q: "Kalau barangnya 50% plastik 50% kertas, masuk mana?", a: "Contohnya paper cup. Karena materialnya sudah menyatu kuat, ini disebut multi-layer packaging. Jika kamu tidak bisa memisahkannya dengan mudah menggunakan tangan, buang ke tong Residu." },
  { q: "Apakah kaca pecah masih bisa didaur ulang?", a: "Ya! Kaca botol pecah masih sangat bisa didaur ulang. Namun, untuk keamanan tukang sampah, bungkus tebal menggunakan koran, lakban rapat, dan tulis 'HATI-HATI KACA PECAH' pakai spidol besar." }
];

export default function KamusSampahPage() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = useMemo(() => {
    return DICTIONARY.filter(item => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase());
      const matchType = filterType === "all" || item.category === filterType;
      return matchQuery && matchType;
    });
  }, [query, filterType]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-[#0F172A] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-white transition bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>
            
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-sm uppercase mb-8">
                <Search size={16} /> Panduan Lengkap
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Kamus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Sampah.</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Jangan asal lempar ke tong! Cari nama barangnya di sini dan ketahui takdir terbaiknya agar tidak berakhir mencemari bumi.
              </p>
              
              <div className="relative max-w-2xl mx-auto mt-8">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ketik nama barang (cth: struk, tisu, styrofoam)..." 
                  className="w-full bg-white text-on-surface px-8 py-5 pl-14 rounded-2xl outline-none shadow-2xl focus:ring-4 focus:ring-blue-500/30 text-lg font-medium border-2 border-transparent transition-all"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Reason Cards */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-10 relative z-20 pb-16">
          <div className="grid md:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-900/5 border border-surface-container">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="font-extrabold text-on-surface mb-2">{r.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dictionary Section */}
        <section className="py-10">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
              {[
                { id: "all", label: "Semua Kategori" },
                { id: "daur-ulang", label: "✅ Daur Ulang Umum" },
                { id: "residu", label: "❌ Residu (TPA)" },
                { id: "khusus", label: "⚠️ Daur Ulang Khusus / B3" }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${
                    filterType === f.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-white border-surface-container text-secondary hover:border-blue-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="bg-surface-container-low p-3 rounded-2xl">
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      item.category === 'residu' ? 'bg-red-50 text-red-600' :
                      item.category === 'daur-ulang' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-on-surface text-xl mb-2">{item.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm border border-surface-container">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-on-surface mb-2">Barang Tidak Ditemukan</h3>
                  <p className="text-secondary max-w-md mx-auto">Kami terus memperbarui database kamus ini. Coba gunakan kata kunci yang lebih umum (contoh: "botol", bukan "botol aqua").</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4 Barang Paling Mengecoh */}
        <section className="py-20 bg-[#F1F5F9] border-y border-surface-container mt-10">
          <div className="max-w-[1000px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-center mb-4 text-on-surface">4 Barang yang Paling Sering Salah Masuk Tong</h2>
            <p className="text-center text-secondary mb-12 max-w-2xl mx-auto">Tampilannya menipu. Kamu mungkin mengira benda-benda ini bisa didaur ulang, padahal tidak!</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Paper Cup (Gelas Kopi Kertas)", reason: "Meski namanya 'paper', bagian dalamnya dilapisi plastik tipis agar tahan air. Kertas dan plastiknya tidak bisa dipisahkan." },
                { title: "Kaca Cermin & Kaca Jendela", reason: "Titik lebur kaca cermin dan jendela berbeda dengan botol kaca minuman. Memasukkannya ke mesin daur ulang botol akan merusak seluruh batch kaca." },
                { title: "Bungkus Snack / Sachet Kemasan", reason: "Terbuat dari gabungan aluminium foil tipis dan plastik (multilayer). Nyaris mustahil didaur ulang karena nilainya sangat rendah." },
                { title: "Kotak Makan Styrofoam", reason: "Styrofoam pecah jadi butiran mikroplastik saat diproses. Sebagian besar fasilitas daur ulang menolaknya mentah-mentah." }
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-500">
                  <h3 className="font-extrabold text-lg mb-2 text-on-surface">{m.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{m.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Pertanyaan Seputar Kamus</h2>
              <p className="text-secondary text-lg">Jawaban cepat untuk kebingunganmu.</p>
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
