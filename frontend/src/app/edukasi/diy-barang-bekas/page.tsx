"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Hammer, PenTool, Image as ImageIcon, Scissors, 
  Lightbulb, Shirt, ArrowRight, Star, Heart, CheckCircle2, AlertTriangle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REASONS = [
  { icon: <Heart size={24} />, title: "Meningkatkan Nilai", desc: "Upcycling mengubah barang tak bernilai (sampah) menjadi barang fungsional atau artistik.", color: "text-rose-600 bg-rose-100 border-rose-200" },
  { icon: <Star size={24} />, title: "Asah Kreativitas", desc: "Melatih otak kanan untuk melihat potensi dari sebuah botol, kaleng, atau kardus usang.", color: "text-amber-600 bg-amber-100 border-amber-200" },
  { icon: <Shirt size={24} />, title: "Hemat Uang", desc: "Tidak perlu membeli tempat pensil, pot bunga, atau hiasan dinding yang mahal.", color: "text-purple-600 bg-purple-100 border-purple-200" },
];

const IDEAS = [
  { 
    icon: <Scissors size={28} />, title: "Pot Tanaman Botol Plastik", color: "emerald",
    desc: "Ubah botol soda bekas 1,5L menjadi pot hidroponik atau pot gantung cantik.",
    steps: [
      "Potong botol menjadi dua bagian.",
      "Balikkan bagian atas botol (corong menghadap ke bawah) dan masukkan ke bagian bawah.",
      "Isi bagian atas dengan tanah, dan biarkan corongnya menjangkau air di bagian bawah (sistem wick)."
    ]
  },
  { 
    icon: <PenTool size={28} />, title: "Tempat Pensil Kaleng", color: "rose",
    desc: "Kaleng susu atau sarden bisa disulap jadi organizer meja belajar yang estetik.",
    steps: [
      "Cuci bersih dan pastikan bibir kaleng tidak tajam (amplas tipis jika perlu).",
      "Lilit seluruh badan kaleng menggunakan tali rami goni dengan bantuan lem tembak.",
      "Hias dengan pita kain perca atau renda renda bekas pakaian."
    ]
  },
  { 
    icon: <ImageIcon size={28} />, title: "Mozaik CD Bekas", color: "blue",
    desc: "CD rusak punya efek pelangi yang sangat indah saat terkena cahaya.",
    steps: [
      "Siapkan bingkai foto lama yang sudah kusam.",
      "Patahkan CD bekas menjadi kepingan-kepingan abstrak yang kecil.",
      "Tempelkan kepingan CD dengan lem tembak di sekeliling bingkai. Jemur hingga kering."
    ]
  },
  { 
    icon: <Shirt size={28} />, title: "Totebag dari Kaos Bekas", color: "orange",
    desc: "Kaos favorit yang sudah robek atau kekecilan tidak perlu dibuang jadi lap.",
    steps: [
      "Gunting bagian lengan dan leher kaos (sebagai pegangan tas).",
      "Gunting rumbai-rumbai di bagian bawah kaos.",
      "Ikat rumbai bagian depan dan belakang dengan erat untuk menutup dasar tas. Selesai tanpa dijahit!"
    ]
  },
  { 
    icon: <Lightbulb size={28} />, title: "Lampu Hias Kardus", color: "yellow",
    desc: "Kardus bekas mie instan bisa dipotong-potong menjadi lampu gantung estetik ala cafe.",
    steps: [
      "Gunting kardus menjadi bentuk cincin dengan berbagai ukuran.",
      "Tumpuk dan rekatkan cincin-cincin tersebut menyerupai sangkar atau bola.",
      "Masukkan bohlam LED (wajib LED agar tidak panas dan membakar kardus)."
    ]
  },
  { 
    icon: <Hammer size={28} />, title: "Rak Sepatu Kayu Palet", color: "gray",
    desc: "Papan kayu bekas palet (Jati Belanda) adalah material andalan para pengrajin DIY.",
    steps: [
      "Lepaskan paku-paku usang, lalu amplas seluruh permukaan kayu agar halus.",
      "Paku atau sekrup papan menjadi bentuk rak bertingkat.",
      "Berikan pelitur atau cat kayu agar tahan rayap dan terlihat elegan."
    ]
  },
];

const SAFETY_TIPS = [
  { text: "Hati-hati dengan tepi tajam dari kaleng seng atau potongan botol plastik tebal. Selalu gunakan amplas atau tutup dengan selotip kertas.", safe: false },
  { text: "Jangan gunakan kaleng bekas cat atau bahan kimia keras sebagai pot tanaman yang bisa dimakan (seperti cabai/tomat) karena residunya beracun.", safe: false },
  { text: "Wajib gunakan lampu LED untuk DIY kap lampu dari kardus/kertas. Bohlam kuning (pijar) menghasilkan panas yang bisa memicu kebakaran.", safe: true },
  { text: "Gunakan masker dan kacamata pelindung jika kamu menggergaji kayu, mengebor besi, atau mematahkan CD kaca.", safe: true }
];

export default function DiyBarangBekasPage() {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
    rose: "text-rose-600 bg-rose-100 border-rose-200",
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    orange: "text-orange-600 bg-orange-100 border-orange-200",
    yellow: "text-yellow-600 bg-yellow-100 border-yellow-200",
    gray: "text-gray-600 bg-gray-100 border-gray-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="bg-[#4A044E] text-white pt-12 pb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>

          <div className="max-w-[1000px] mx-auto px-6 relative z-10">
            <div className="mb-16">
              <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-200 hover:text-white transition group bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <ArrowLeft size={16} /> Kembali ke Pusat Edukasi
              </Link>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/50 font-bold text-sm tracking-wide mb-8 uppercase">
                <Hammer size={16} /> Kreativitas (Upcycling)
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                Seni <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-400">DIY Barang Bekas.</span>
              </h1>
              <p className="text-lg md:text-xl text-fuchsia-50/70 leading-relaxed max-w-2xl mx-auto mb-10">
                Berikan kesempatan hidup kedua (dan ketiga) untuk barang-barang yang sudah tidak terpakai dengan sentuhan magis tangan kreatifmu.
              </p>
              <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})} className="inline-flex items-center justify-center bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 gap-2">
                Jelajahi Ide Kreatif <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Reason Cards */}
        <div className="max-w-[1000px] mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {REASONS.map((r, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-fuchsia-900/5 border border-surface-container flex gap-4 items-start">
                <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center border ${r.color}`}>
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-on-surface mb-2">{r.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Ide Kreatif Detailed */}
        <section className="py-10 bg-white border-y border-surface-container">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">6 Inspirasi Proyek Akhir Pekanmu</h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">Peralatan sederhana, hasil yang estetik dan fungsional.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {IDEAS.map((item, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-3xl p-8 border border-surface-container hover:shadow-md transition">
                  <div className="flex gap-5 items-start mb-6">
                    <div className={`w-16 h-16 shrink-0 rounded-[1.25rem] flex items-center justify-center border-4 border-white shadow-md ${colorMap[item.color]}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-on-surface mb-2">{item.title}</h3>
                      <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-surface-container">
                    <span className="font-bold text-xs uppercase text-gray-500 tracking-wider block mb-3">Langkah Pembuatan:</span>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-on-surface font-medium">
                      {item.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed pl-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="py-20">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[3rem] p-8 md:p-12 text-white shadow-xl">
              <div className="text-center mb-10">
                <AlertTriangle className="text-yellow-400 mx-auto mb-4" size={40} />
                <h2 className="text-3xl font-extrabold mb-2">Tips Keselamatan (Wajib Dibaca!)</h2>
                <p className="text-gray-400">Berkarya itu menyenangkan, tapi keselamatan adalah nomor satu.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {SAFETY_TIPS.map((tip, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex gap-4 items-start">
                    {tip.safe ? <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={24} /> : <AlertTriangle className="text-orange-400 shrink-0 mt-1" size={24} />}
                    <p className="text-sm text-gray-200 leading-relaxed font-semibold">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Box */}
        <section className="pb-32 pt-10">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="bg-fuchsia-50 rounded-[3rem] p-12 text-center shadow-md border border-fuchsia-100 relative overflow-hidden">
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#4A044E] mb-6 relative z-10">Punya Karya DIY Keren?</h3>
              <p className="text-fuchsia-900/80 mb-10 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
                Jangan simpan sendiri karya upcycling andalanmu! Bergabung dengan forum komunitas DaurlY, tunjukkan hasil karyamu, dan inspirasi ribuan orang lainnya.
              </p>
              
              <div className="flex justify-center relative z-10">
                <Link href="/bantuan/faq" className="inline-flex items-center justify-center bg-[#4A044E] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#701A75] hover:-translate-y-1 transition-all shadow-lg">
                  Bergabung dengan Komunitas
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
