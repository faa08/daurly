"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BadgeInfo, AlertTriangle, CheckCircle2, ShieldAlert,
  ChevronDown, HelpCircle, Activity, Box, Search, ArrowRight, XCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <ShieldAlert size={24} />, title: "Hindari Keracunan", desc: "Tidak semua plastik aman untuk makanan panas. Tahu kodenya, hindari racun BPA dan Phthalates.", color: "text-red-600 bg-red-100 border-red-200" },
  { icon: <CheckCircle2 size={24} />, title: "Bijak Memilah", desc: "Tahu mana plastik yang gampang didaur ulang dan laku dijual (seperti botol PET).", color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
  { icon: <Activity size={24} />, title: "Kurangi Mikroplastik", desc: "Plastik murahan gampang rontok menjadi mikroplastik yang masuk ke air minum kita.", color: "text-blue-600 bg-blue-100 border-blue-200" },
  { icon: <Box size={24} />, title: "Gunakan Berulang", desc: "Tahu jenis plastik mana yang didesain untuk dipakai ribuan kali (seperti Tupperware asli).", color: "text-amber-600 bg-amber-100 border-amber-200" },
];

const CODES = [
  { 
    num: "1", name: "PETE / PET", color: "blue",
    desc: "Polyethylene Terephthalate. Plastik jernih, ringan, dan murah. Sangat mudah didaur ulang.",
    examples: "Botol air mineral, botol soda, toples selai bening.",
    safety: "HANYA UNTUK SEKALI PAKAI. Jangan diisi air panas atau dijemur di mobil. Berisiko melepas zat antimon jika dipakai berulang."
  },
  { 
    num: "2", name: "HDPE", color: "emerald",
    desc: "High-Density Polyethylene. Plastik kaku, tebal, dan tahan panas. Sangat aman dan mudah didaur ulang.",
    examples: "Botol sampo, jerigen minyak, botol susu putih kaku, mainan anak.",
    safety: "SANGAT AMAN. Tahan panas hingga batas tertentu, cocok dipakai berulang kali. Tidak melepas bahan kimia berbahaya."
  },
  { 
    num: "3", name: "PVC", color: "red",
    desc: "Polyvinyl Chloride. Fleksibel tapi SANGAT BERACUN. Mustahil didaur ulang secara umum.",
    examples: "Pipa air, selang, pembungkus daging (cling wrap murahan), jas hujan.",
    safety: "SANGAT BERBAHAYA UNTUK MAKANAN. Mengandung DEHA yang bisa lumer saat panas. Jauhkan dari makanan!"
  },
  { 
    num: "4", name: "LDPE", color: "yellow",
    desc: "Low-Density Polyethylene. Plastik fleksibel, tipis, dan kuat. Susah didaur ulang karena bikin nyangkut di mesin.",
    examples: "Kantong kresek, bubble wrap, plastik pelapis baju, plastik sampah.",
    safety: "AMAN. Tidak bereaksi secara kimia. Boleh dipakai berulang kali namun kurangi pemakaian karena mencemari lingkungan."
  },
  { 
    num: "5", name: "PP", color: "green",
    desc: "Polypropylene. Keras, fleksibel, tahan panas tinggi. Pilihan TERBAIK untuk tempat makan dan botol susu bayi.",
    examples: "Tupperware, kotak bekal, botol susu bayi, sedotan keras.",
    safety: "SANGAT AMAN UNTUK MAKANAN PANAS. Tahan masuk ke microwave dan mesin cuci piring. Tidak melepas BPA."
  },
  { 
    num: "6", name: "PS", color: "orange",
    desc: "Polystyrene. Murah, ringan. Bentuk kaku atau jadi busa (Styrofoam). Mustahil didaur ulang.",
    examples: "Gabus styrofoam, sendok/garpu plastik sekali pakai, cup mie instan.",
    safety: "BERBAHAYA UNTUK MAKANAN PANAS/BERMINYAK. Melepas styrene yang terbukti merusak otak dan memicu kanker."
  },
  { 
    num: "7", name: "OTHER", color: "gray",
    desc: "Campuran plastik lain. Bisa sangat aman (Tritan/PC murni tanpa BPA) atau sangat berbahaya (mengandung BPA).",
    examples: "Galon isi ulang berbahan PC (Polycarbonate), botol minum bayi jadul.",
    safety: "HARUS HATI-HATI. Pastikan ada tulisan 'BPA FREE'. Jika botol PC kode 7 tergores, BPA bisa luntur ke air minum."
  },
];

const MYTHS = [
  { myth: "Plastik dengan kode 1-7 itu menunjukkan berapa kali boleh dipakai.", fact: "SALAH BESAR! Angka itu HANYA menunjukkan jenis bahan plastiknya (resin code), BUKAN jumlah pemakaian." },
  { myth: "Semua botol plastik berlogo segitiga pasti bisa didaur ulang.", fact: "TIDAK BENAR. Logo segitiga (chasing arrows) di bawah botol BUKAN tanda pasti bisa didaur ulang di wilayahmu, itu hanya identitas bahannya." },
  { myth: "Plastik tebal pasti lebih aman daripada yang tipis.", fact: "KETEBALAN BUKAN PATOKAN. Jerigen tipis (HDPE-2) jauh lebih aman menahan panas daripada piring plastik kaku berbahan Polystyrene (PS-6)." },
  { myth: "BPA Free berarti plastik itu 100% sehat.", fact: "BPA diganti dengan BPS atau BPF yang kadang memiliki sifat kimia serupa. Paling aman tetap botol stainless steel atau kaca!" },
];

const FAQS = [
  { q: "Di mana saya bisa menemukan kode ini?", a: "Biasanya dicetak timbul di bagian bawah (dasar) botol atau kontainer plastik. Cari simbol segitiga dengan angka di tengahnya." },
  { q: "Apa yang terjadi kalau botol mineral (PET/1) diisi air panas?", a: "Botol akan langsung mengerut atau meleleh. Air panas juga akan melunturkan senyawa antimon (bahan pembuat plastik) ke dalam air minumanmu." },
  { q: "Plastik mana yang boleh masuk microwave?", a: "HANYA Kode 5 (PP / Polypropylene). Itupun pastikan ada label tambahan bertuliskan 'Microwave Safe'." },
  { q: "Apakah kantong kresek (LDPE/4) berbahaya buat membungkus gorengan panas?", a: "Ya! Panas dan minyak pada gorengan bisa melunturkan bahan kimia plastik. Selalu gunakan kertas makanan atau tisu tebal." },
];

export default function KodePlastikPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
    red: "text-red-600 bg-red-100 border-red-200",
    yellow: "text-yellow-600 bg-yellow-100 border-yellow-200",
    green: "text-green-600 bg-green-100 border-green-200",
    orange: "text-orange-600 bg-orange-100 border-orange-200",
    gray: "text-gray-600 bg-gray-100 border-gray-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#451A03] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-sm tracking-wide mb-8 uppercase">
                <BadgeInfo size={16} /> Edukasi Material
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Membaca Rahasia <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Kode Plastik.</span>
              </h1>
              <p className="text-lg md:text-xl text-amber-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Pernah lihat angka dalam segitiga di bawah botol minummu? Itu bukan angka sembarangan. Cari tahu mana yang aman dan mana yang diam-diam beracun.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 gap-2">
                Lihat 7 Kode Plastik <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Reason Cards */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-amber-900/5 border border-surface-container">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="font-extrabold text-on-surface mb-2">{r.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Kode Plastik Detailed */}
        <section className="py-20 bg-white border-y border-surface-container">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">7 Kode Resin Plastik Global</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Sistem klasifikasi internasional untuk mempermudah daur ulang.</p>
            </div>
            
            <div className="space-y-6">
              {CODES.map((c, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-3xl p-8 border border-surface-container hover:shadow-md transition flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className={`w-28 h-28 shrink-0 rounded-[2rem] flex flex-col items-center justify-center border-4 border-white shadow-xl ${colorMap[c.color]}`}>
                    <span className="text-5xl font-black">{c.num}</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-3xl font-extrabold text-on-surface mb-3">{c.name}</h3>
                    <p className="text-secondary leading-relaxed mb-4 text-base">{c.desc}</p>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl border border-surface-container flex gap-3 items-start">
                        <Search className="text-gray-400 shrink-0" size={20} />
                        <div>
                          <span className="font-bold text-on-surface text-sm block mb-1">Biasa Ditemukan Pada:</span>
                          <span className="text-secondary text-sm leading-relaxed">{c.examples}</span>
                        </div>
                      </div>
                      
                      <div className={`bg-white p-4 rounded-xl border ${c.num === '3' || c.num === '6' ? 'border-red-200' : 'border-emerald-200'} flex gap-3 items-start`}>
                        {c.num === '3' || c.num === '6' ? <AlertTriangle className="text-red-500 shrink-0" size={20} /> : <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
                        <div>
                          <span className={`font-bold text-sm block mb-1 ${c.num === '3' || c.num === '6' ? 'text-red-600' : 'text-emerald-600'}`}>Tingkat Keamanan:</span>
                          <span className="text-secondary text-sm leading-relaxed">{c.safety}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mitos vs Fakta */}
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#451A03] to-[#78350F] rounded-[3rem] p-8 md:p-16 text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">4 Mitos Menyesatkan</h2>
              <p className="text-amber-200/80 text-center mb-12 max-w-2xl mx-auto text-lg">Hati-hati dengan informasi palsu yang beredar di grup WhatsApp keluarga!</p>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {MYTHS.map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex gap-3 items-start mb-4">
                      <XCircle className="text-red-400 shrink-0 mt-1" size={20} />
                      <p className="font-medium text-gray-200 line-through decoration-red-500/50">Mitos: {m.myth}</p>
                    </div>
                    <div className="flex gap-3 items-start ml-2 pl-6 border-l-2 border-emerald-500/30">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={20} />
                      <p className="text-sm text-amber-100 leading-relaxed font-bold">Fakta: {m.fact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white border-t border-surface-container">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Pertanyaan Seputar Plastik</h2>
              <p className="text-secondary text-lg">Yang sering bikin orang bingung.</p>
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
