"use client";

import Link from "next/link";
import { ChevronRight, Store, Package, Wallet, MessageSquare, MapPin } from "lucide-react";
import { PICKUP_STORE_ADDRESS } from "@/lib/checkoutConstants";

const STEPS = [
  {
    title: "Perajin titip produk",
    desc: "Perajin mendaftar dan menitipkan barang ke Daurly. Stok dan katalog dikelola di platform.",
  },
  {
    title: "Platform yang jual",
    desc: "Pembeli bertransaksi lewat satu pintu — bukan langsung ke masing-masing penjual. Tim kami yang melayani pembeli.",
  },
  {
    title: "Bayar ke platform",
    desc: "Pembayaran digital masuk ke sistem kami, atau pembeli bayar & ambil di toko fisik (pickup).",
  },
  {
    title: "Pengiriman diatur admin",
    desc: "Setelah bayar digital, admin menghubungi pembeli via chat untuk koordinasi pengiriman.",
  },
  {
    title: "Perajin terima hasil",
    desc: "Setelah transaksi selesai, pendapatan dicatat ke saldo perajin/mitra sesuai kebijakan platform.",
  },
];

export default function KonsinyasiPage() {
  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[1100px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Model Konsinyasi</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Store size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface">Model Konsinyasi Daurly</h1>
          </div>
          <p className="text-secondary text-sm max-w-2xl leading-relaxed">
            Daurly bukan marketplace tempat tiap penjual kirim sendiri. Ini platform <strong>titip jual</strong>:
            Perajin menitipkan produk daur ulang, kami yang urus penjualan, pembayaran, dan layanan ke pembeli.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-on-surface mb-6">Cara kerjanya</h2>
            <div className="space-y-5">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{step.title}</p>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm">
              <Package size={20} className="text-primary mb-3" />
              <p className="font-bold text-sm mb-1">Untuk Pembeli</p>
              <p className="text-xs text-secondary leading-relaxed">
                Belanja produk daur ulang terkurasi, bayar aman, ambil di toko atau kirim dengan bantuan admin.
              </p>
            </div>
            <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm">
              <Wallet size={20} className="text-amber-600 mb-3" />
              <p className="font-bold text-sm mb-1">Untuk Perajin</p>
              <p className="text-xs text-secondary leading-relaxed">
                Fokus produksi & kualitas barang daur ulang. Penjualan, chat pengiriman, dan return ditangani platform.
              </p>
            </div>
            <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm">
              <MessageSquare size={20} className="text-green-600 mb-3" />
              <p className="font-bold text-sm mb-1">Lokasi Pickup</p>
              <p className="text-xs text-secondary leading-relaxed flex gap-1.5">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                {PICKUP_STORE_ADDRESS}
              </p>
            </div>
          </div>

          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <p className="text-sm text-on-surface leading-relaxed">
              Ingin menitipkan produk? Mitra perajin didaftarkan oleh tim Daurly (bukan lewat form online).
              Hubungi kami lewat{" "}
              <Link href="/kontak" className="text-primary font-bold hover:underline">halaman Kontak</Link>
              {" "}atau Customer Service untuk koordinasi konsinyasi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
