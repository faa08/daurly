"use client";

import Link from "next/link";
import { ChevronRight, Heart, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PICKUP_STORE_ADDRESS } from "@/lib/checkoutConstants";

const VALUES = [
  { icon: <Heart size={20} />, title: "Berdayakan Daur Ulang", desc: "Kami percaya setiap produk lokal punya cerita dan kualitas yang layak dikenal dunia." },
  { icon: <Shield size={20} />, title: "Transaksi Aman", desc: "Sistem escrow dan enkripsi SSL memastikan setiap transaksi berjalan aman dan terpercaya." },
  { icon: <Zap size={20} />, title: "Teknologi Modern", desc: "Platform kami dirancang untuk kemudahan seller and buyer, dari desa hingga kota besar." },
];

export default function TentangPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-[1100px] mx-auto px-6 pt-8">
          <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
            <Link href="/" className="hover:text-primary transition">Beranda</Link>
            <ChevronRight size={12} />
            <span className="text-on-surface font-semibold">Tentang Kami</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#15803D] text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-6 uppercase tracking-wider">
              Platform Daur Ulang Indonesia
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Memajukan Daur Ulang Indonesia<br />
              <span className="opacity-80">Satu Produk Lokal</span>
            </h1>
            <p className="text-base opacity-85 max-w-2xl mx-auto leading-relaxed mb-8">
              Daurly adalah platform <strong>titip jual (konsinyasi)</strong> yang menghubungkan produk daur ulang Indonesia
              dengan pembeli — kami urus penjualan, pembayaran, dan pengiriman.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/kategori" className="px-6 py-3 bg-white/15 border border-white/30 text-white font-bold text-sm rounded-lg hover:bg-white/25 transition">
                Jelajahi Produk
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-16">

          {/* Story */}
          <div className="bg-white border border-surface-container rounded-xl p-10 shadow-sm">
            <h2 className="text-2xl font-extrabold text-on-surface mb-2">Cerita Kami</h2>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-8">
              Dari Link Productive · Inkubator Bisnis Berbasis Dampak
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-secondary leading-relaxed">
              <div className="space-y-4">
                <p>
                  <strong className="text-on-surface">Daurly</strong> adalah ekosistem digital yang lahir dari{" "}
                  <strong className="text-on-surface">Link Productive (LinkPro)</strong> — tim inovasi teknologi yang
                  berkantor di {PICKUP_STORE_ADDRESS}.
                </p>
                <p>
                  Sejak awal berdiri, Link Productive berfokus pada pengembangan solusi digital dan peningkatan
                  produktivitas. Melalui <strong className="text-on-surface">Program Inkubator Bisnis Terintegrasi</strong>,
                  kami mendampingi perusahaan, pemerintah, perguruan tinggi, dan lembaga pembangunan dalam menciptakan
                  serta mengembangkan usaha daur ulang dan startup yang mandiri, kompetitif, dan berkelanjutan.
                </p>
                <p>
                  Program ini tidak hanya menaikkan kapasitas bisnis peserta, tetapi juga menargetkan dampak ekonomi,
                  sosial, dan lingkungan yang terukur melalui pendekatan <strong className="text-on-surface">SDGs dan SROI</strong>.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  Namun perjalanan kami di lapangan membuka mata pada realitas yang menantang: Indonesia — khususnya
                  daerah Cilegon — memiliki usaha daur ulang lokal berbakat dengan produk luar biasa.
                </p>
                <p>
                  Sayangnya, mayoritas dari mereka menghadapi kendala yang sama:{" "}
                  <strong className="text-on-surface">keterbatasan akses pasar</strong> dan{" "}
                  <strong className="text-on-surface">minimnya infrastruktur digital</strong> yang ramah bagi pelaku usaha kecil.
                </p>
                <p>
                  Daurly hadir sebagai jawaban — platform <strong className="text-on-surface">titip jual (konsinyasi)</strong> yang
                  menghubungkan karya daur ulang dengan pembeli yang menghargai kualitas dan keaslian. Kami urus penjualan,
                  pembayaran, dan pengiriman, agar pelaku usaha bisa fokus pada produk terbaiknya.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-6">Nilai Kami</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary mb-4">{v.icon}</div>
                  <h3 className="font-extrabold text-on-surface mb-2">{v.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
