"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Globe, TrendingUp, AlertTriangle, Users, 
  Map, Trash2, ShieldAlert, Heart, ChevronDown, CheckSquare, Square
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <Trash2 size={24} />, title: "Gunung Sampah TPA", desc: "TPA Bantar Gebang setinggi gedung 16 lantai. Jika tak diatasi, seluruh Indonesia akan kehabisan lahan.", color: "text-orange-600 bg-orange-100 border-orange-200" },
  { icon: <Map size={24} />, title: "Mencemari Sungai", desc: "Sungai Citarum pernah dinobatkan sebagai salah satu sungai paling tercemar di dunia karena plastik.", color: "text-blue-600 bg-blue-100 border-blue-200" },
  { icon: <ShieldAlert size={24} />, title: "Bencana Mikroplastik", desc: "Mikroplastik telah ditemukan di perut ikan yang kita makan, bahkan di darah manusia.", color: "text-red-600 bg-red-100 border-red-200" },
  { icon: <Heart size={24} />, title: "Untuk Generasi Depan", desc: "Kita tidak mewariskan bumi yang sehat jika anak cucu kita hidup di tengah tumpukan sampah.", color: "text-emerald-600 bg-emerald-100 border-emerald-200" },
];

const FACTS = [
  { 
    icon: <TrendingUp size={36} />, title: "68,5 Juta Ton / Tahun", 
    desc: "Indonesia menghasilkan sekitar 68,5 juta ton sampah setiap tahunnya. Jika dikumpulkan, volumenya cukup untuk menutupi seluruh luas stadion Gelora Bung Karno hingga ratusan meter ke atas.", 
    color: "text-indigo-600 bg-indigo-100 border-indigo-200" 
  },
  { 
    icon: <AlertTriangle size={36} />, title: "Hanya 7% Didaur Ulang", 
    desc: "Dari jutaan ton sampah plastik yang dihasilkan, hanya sekitar 7% yang berhasil didaur ulang. Sisanya (93%) menumpuk di TPA, dibakar ilegal, atau bocor mencemari sungai dan lautan.", 
    color: "text-red-600 bg-red-100 border-red-200" 
  },
  { 
    icon: <Globe size={36} />, title: "Penyumbang Plastik ke Laut Ke-2", 
    desc: "Berdasarkan riset Jenna Jambeck (2015), Indonesia menduduki peringkat kedua dunia sebagai penyumbang sampah plastik terbesar ke lautan setelah Tiongkok.", 
    color: "text-blue-600 bg-blue-100 border-blue-200" 
  },
  { 
    icon: <Users size={36} />, title: "100+ TPA Sudah Overload", 
    desc: "Lebih dari 100 Tempat Pembuangan Akhir (TPA) di berbagai kota besar di Indonesia sudah melebihi kapasitas (overload), menyebabkan potensi bencana longsor sampah dan pencemaran udara beracun.", 
    color: "text-orange-600 bg-orange-100 border-orange-200" 
  },
];

const HORIZONTAL_FACTS = [
  "Rata-rata setiap penduduk Indonesia menghasilkan 0,7 kg sampah per hari.",
  "Setiap menit, ada setara 1 truk sampah plastik yang dibuang ke lautan global.",
  "Sekitar 60% sampah di Indonesia didominasi oleh sampah organik (sisa makanan/daun).",
  "Jika seluruh sisa makanan di dunia adalah sebuah negara, ia akan jadi penghasil emisi rumah kaca ke-3 terbesar.",
  "TPA Bantar Gebang menerima sekitar 7.000 ton sampah HANYA dari warga Jakarta setiap harinya.",
];

export default function FaktaSampahPage() {
  const [checked, setChecked] = useState<number[]>([]);

  const checklistItems = [
    "Saya sudah mulai memisahkan sampah organik dan plastik.",
    "Saya menolak kantong plastik saat berbelanja minimal 3x minggu ini.",
    "Saya memastikan tidak ada makanan basi (food waste) di kulkas.",
    "Saya mencuci botol plastik sebelum membuangnya.",
    "Saya membagikan fakta dari halaman ini ke minimal 1 orang teman."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#1E1B4B] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 font-bold text-sm tracking-wide mb-8 uppercase">
                <AlertTriangle size={16} className="text-amber-400" /> Darurat Sampah Nasional
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Fakta Pahit <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">Sampah Indonesia.</span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Angka-angka ini bukan sekadar statistik. Ini adalah peringatan krisis nyata yang terjadi di halaman belakang negara kita sendiri.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Reason Cards */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-4 gap-4">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-900/5 border border-surface-container">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                  {r.icon}
                </div>
                <h3 className="font-extrabold text-on-surface mb-2">{r.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Big Data Section */}
        <section className="py-10 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Melihat Kondisi Sebenarnya</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Kompilasi data dari Kementerian Lingkungan Hidup dan berbagai riset global.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {FACTS.map((item, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-3xl p-8 shadow-sm border border-surface-container flex flex-col items-center text-center hover:shadow-md transition group">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-lg mb-6 transition-transform group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface mb-4">{item.title}</h3>
                  <p className="text-secondary leading-relaxed text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Horizontal Facts */}
        <section className="py-20 overflow-hidden bg-indigo-50">
          <div className="max-w-[1000px] mx-auto px-6 mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-2">Pecahan Fakta Lainnya</h2>
              <p className="text-indigo-800/70">Geser untuk membaca realita pahit di sekitar kita.</p>
            </div>
          </div>
          <div className="flex overflow-x-auto pb-8 pt-4 px-6 gap-6 snap-x snap-mandatory hide-scrollbar max-w-[1200px] mx-auto">
            {HORIZONTAL_FACTS.map((f, i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-center min-h-[200px] border border-indigo-100">
                <div className="text-5xl font-black text-indigo-100 mb-4">0{i+1}</div>
                <p className="text-[#1E1B4B] font-bold leading-relaxed text-lg">{f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section className="py-20 bg-white border-b border-surface-container">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-on-surface mb-4 text-center">Apa yang Bisa Kita Lakukan?</h2>
            <p className="text-secondary mb-10 text-center text-lg">Jangan pesimis! Perubahan besar dimulai dari dapur rumahmu. Coba komitmen ringan ini.</p>
            
            <div className="bg-white border-2 border-indigo-50 rounded-3xl p-8 shadow-md">
              <div className="space-y-4">
                {checklistItems.map((item, idx) => {
                  const isChecked = checked.includes(idx);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setChecked(prev => isChecked ? prev.filter(i => i !== idx) : [...prev, idx])}
                      className={`flex gap-4 items-center p-5 rounded-2xl cursor-pointer transition border-2 ${isChecked ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`}
                    >
                      <div className={`shrink-0 ${isChecked ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {isChecked ? <CheckSquare size={28} /> : <Square size={28} />}
                      </div>
                      <span className={`flex-1 text-on-surface font-semibold transition-all ${isChecked ? 'line-through text-indigo-400' : ''}`}>
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-8 text-center text-sm font-bold text-indigo-600 bg-indigo-50 p-4 rounded-xl">
                Komitmen Saya: {checked.length} / {checklistItems.length} Selesai 💪
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
