"use client";

import Link from "next/link";
import { ChevronRight, Leaf, Trash2, Recycle, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ARTICLES = [
  {
    icon: <Trash2 size={24} />,
    title: "Panduan Memilah Sampah",
    desc: "Kenali jenis-jenis sampah dan cara memilahnya dengan benar dari rumah Anda.",
    color: "text-blue-600 bg-blue-100",
    link: "/edukasi/panduan-memilah-sampah",
  },
  {
    icon: <Leaf size={24} />,
    title: "Cara Membuat Kompos",
    desc: "Ubah sisa makanan dan sampah organik menjadi pupuk penyubur tanaman.",
    color: "text-green-600 bg-green-100",
    link: "/edukasi/cara-membuat-kompos",
  },
  {
    icon: <Recycle size={24} />,
    title: "Ekonomi Sirkular",
    desc: "Pelajari bagaimana membeli produk daur ulang membantu melestarikan bumi.",
    color: "text-purple-600 bg-purple-100",
    link: "/edukasi/ekonomi-sirkular",
  },
];

export default function EdukasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-[1100px] mx-auto px-6 pt-8">
          <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
            <Link href="/" className="hover:text-primary transition">Beranda</Link>
            <ChevronRight size={12} />
            <span className="text-on-surface font-semibold">Edukasi</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#15803D] text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-6 uppercase tracking-wider">
              <BookOpen size={14} />
              Pusat Edukasi Daurly
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Langkah Kecil, <br />
              <span className="opacity-80">Dampak Besar untuk Bumi</span>
            </h1>
            <p className="text-base opacity-85 max-w-2xl mx-auto leading-relaxed mb-8">
              Temukan berbagai panduan, tips, dan wawasan seputar pengelolaan sampah, daur ulang, dan gaya hidup ramah lingkungan di sini.
            </p>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-16">
          
          {/* Topik Utama */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-on-surface">Topik Pilihan</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {ARTICLES.map((article, idx) => (
                <Link href={article.link} key={idx} className="bg-white border border-surface-container rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col h-full group block">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${article.color}`}>
                    {article.icon}
                  </div>
                  <h3 className="text-lg font-extrabold text-on-surface mb-3 group-hover:text-primary transition">{article.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed flex-1">{article.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm">
                    Baca Selengkapnya <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Deep Dive Content */}
          <div className="bg-white border border-surface-container rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2 block">Mulai dari Rumah</span>
                <h2 className="text-3xl font-extrabold text-on-surface mb-6 leading-tight">
                  Mengapa Kita Harus Memilah Sampah?
                </h2>
                <div className="space-y-4 text-sm text-secondary leading-relaxed">
                  <p>
                    Memilah sampah adalah langkah paling krusial dalam rantai daur ulang. Jika semua sampah (organik, plastik, kertas) dibuang dalam satu tempat, proses daur ulang menjadi sangat sulit karena material telah tercampur dan terkontaminasi.
                  </p>
                  <p>
                    Dengan memisahkan sampah organik (sisa makanan, daun) dari anorganik (plastik, kaca, kertas), Anda telah berkontribusi besar untuk:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-2 text-on-surface font-medium">
                    <li>Mengurangi tumpukan di Tempat Pembuangan Akhir (TPA).</li>
                    <li>Meningkatkan nilai jual bahan baku daur ulang.</li>
                    <li>Mencegah pencemaran lingkungan dan bau tak sedap.</li>
                  </ul>
                  <div className="pt-4">
                    <Link href="/kategori" className="inline-flex items-center justify-center bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition">
                      Dukung Produk Daur Ulang
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-[#F5F9F6] rounded-3xl p-8 flex items-center justify-center min-h-[340px] border border-[#E3ECE6]">
                <div className="text-center">
                  <div className="flex gap-4 justify-center mb-6">
                    <div className="w-20 h-24 bg-blue-100 rounded-t-xl rounded-b-md flex items-end justify-center pb-3 border border-blue-200">
                      <Trash2 className="text-blue-500" size={32} />
                    </div>
                    <div className="w-20 h-24 bg-green-100 rounded-t-xl rounded-b-md flex items-end justify-center pb-3 border border-green-200">
                      <Leaf className="text-green-500" size={32} />
                    </div>
                    <div className="w-20 h-24 bg-yellow-100 rounded-t-xl rounded-b-md flex items-end justify-center pb-3 border border-yellow-200">
                      <Recycle className="text-yellow-500" size={32} />
                    </div>
                  </div>
                  <p className="text-primary font-bold">Kenali Jenis Sampahmu</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
