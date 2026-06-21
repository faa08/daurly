"use client";

import Link from "next/link";
import { ChevronRight, Users, ShoppingBag, Star, TrendingUp, Heart, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATS = [
  { icon: <Users size={22} />, value: "15.000+", label: "Pelaku UMKM" },
  { icon: <ShoppingBag size={22} />, value: "500+", label: "Kategori Produk" },
  { icon: <Star size={22} />, value: "4.9/5", label: "Rating Platform" },
  { icon: <TrendingUp size={22} />, value: "Rp 12M+", label: "Total Transaksi" },
];

const VALUES = [
  { icon: <Heart size={20} />, title: "Berdayakan UMKM", desc: "Kami percaya setiap produk lokal punya cerita dan kualitas yang layak dikenal dunia." },
  { icon: <Shield size={20} />, title: "Transaksi Aman", desc: "Sistem escrow dan enkripsi SSL memastikan setiap transaksi berjalan aman dan terpercaya." },
  { icon: <Zap size={20} />, title: "Teknologi Modern", desc: "Platform kami dirancang untuk kemudahan seller dan buyer, dari desa hingga kota besar." },
];

const TEAM = [
  { name: "Budi Santoso", role: "CEO & Co-Founder", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" },
  { name: "Siti Rahayu", role: "CTO & Co-Founder", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" },
  { name: "Andi Wijaya", role: "Head of Operations", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" },
  { name: "Dewi Kusuma", role: "Head of Marketing", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" },
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
        <div className="bg-gradient-to-br from-primary to-[#1E40AF] text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-6 uppercase tracking-wider">
              Platform UMKM Indonesia
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Memajukan UMKM Indonesia<br />
              <span className="opacity-80">Satu Produk Lokal</span>
            </h1>
            <p className="text-base opacity-85 max-w-2xl mx-auto leading-relaxed mb-8">
              Pelataran UMKM adalah marketplace digital yang menghubungkan pelaku usaha mikro, kecil, dan menengah Indonesia dengan jutaan pembeli di seluruh nusantara.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/daftar" className="px-6 py-3 bg-white text-primary font-bold text-sm rounded-lg hover:brightness-95 transition">
                Mulai Berjualan
              </Link>
              <Link href="/kategori" className="px-6 py-3 bg-white/15 border border-white/30 text-white font-bold text-sm rounded-lg hover:bg-white/25 transition">
                Jelajahi Produk
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-16 space-y-16">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border border-surface-container rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary mx-auto mb-3">
                  {s.icon}
                </div>
                <p className="text-2xl font-extrabold text-on-surface mb-1">{s.value}</p>
                <p className="text-xs text-secondary font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="bg-white border border-surface-container rounded-xl p-10 shadow-sm">
            <h2 className="text-2xl font-extrabold text-on-surface mb-6">Cerita Kami</h2>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-secondary leading-relaxed">
              <div className="space-y-4">
                <p>Pelataran UMKM lahir dari keprihatinan mendalam terhadap ribuan pengrajin lokal berbakat yang produknya sulit menjangkau pasar yang lebih luas. Di balik setiap batik tulis, keramik handmade, dan kopi arabika premium, ada kisah perjuangan pelaku usaha yang penuh semangat.</p>
                <p>Kami percaya bahwa teknologi adalah jembatan terbaik untuk menghubungkan keindahan produk lokal dengan pembeli yang menghargai kualitas dan keaslian.</p>
              </div>
              <div className="space-y-4">
                <p>Didirikan pada 2023 di Yogyakarta, kami memulai dengan visi sederhana: buat platform yang benar-benar memahami kebutuhan UMKM Indonesia — mudah digunakan, aman, dan terjangkau.</p>
                <p>Kini Pelataran UMKM telah melayani lebih dari 15.000 pelaku usaha dari Sabang sampai Merauke, dengan ribuan produk autentik yang bisa ditemukan di satu tempat.</p>
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

          {/* Team */}
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-6">Tim Kami</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {TEAM.map((m) => (
                <div key={m.name} className="bg-white border border-surface-container rounded-xl p-6 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary-container">
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-sm text-on-surface">{m.name}</p>
                  <p className="text-xs text-secondary mt-0.5">{m.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary to-[#1E40AF] rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">Siap Bergabung?</h2>
            <p className="opacity-85 text-sm mb-6 max-w-md mx-auto">Daftarkan toko UMKM kamu sekarang dan mulai jangkau pembeli dari seluruh Indonesia.</p>
            <Link href="/daftar" className="inline-block px-8 py-3 bg-white text-primary font-bold text-sm rounded-lg hover:brightness-95 transition">
              Daftar Gratis Sekarang
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
