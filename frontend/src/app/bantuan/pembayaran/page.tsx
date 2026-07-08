"use client";

import Link from "next/link";
import { ChevronRight, CreditCard, Store, MapPin, ShieldCheck } from "lucide-react";
import { PICKUP_STORE_ADDRESS, CHECKOUT_PAYMENT_OPTIONS } from "@/lib/checkoutConstants";

export default function PembayaranPage() {
  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[1100px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Pembayaran & Pickup</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-on-surface mb-2">Pembayaran & Pickup</h1>
          <p className="text-secondary text-sm max-w-2xl">
            Saat checkout, Anda memilih salah satu dari dua metode berikut.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {CHECKOUT_PAYMENT_OPTIONS.map((opt) => (
            <section
              key={opt.id}
              className="bg-white border border-surface-container rounded-xl p-7 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                {opt.id === "digital" ? (
                  <CreditCard size={22} className="text-primary" />
                ) : (
                  <Store size={22} className="text-orange-600" />
                )}
                <h2 className="text-lg font-extrabold text-on-surface">{opt.name}</h2>
              </div>
              <p className="text-sm text-secondary mb-4">{opt.desc}</p>
              {opt.id === "digital" ? (
                <ul className="text-xs text-secondary space-y-2 list-disc list-inside">
                  <li>Alamat pengiriman wajib diisi.</li>
                  <li>Redirect ke Midtrans (VA, e-wallet, kartu).</li>
                  <li>Setelah bayar sukses, admin chat Anda untuk atur pengiriman.</li>
                  <li>Lihat status di <Link href="/account/orders" className="text-primary font-bold">Pesanan Saya</Link>.</li>
                </ul>
              ) : (
                <ul className="text-xs text-secondary space-y-2 list-disc list-inside">
                  <li>Tanpa ongkir — ambil sendiri di toko kami.</li>
                  <li>Konfirmasi alamat pickup (waktu baca 10 detik).</li>
                  <li>Bayar & ambil barang di lokasi toko.</li>
                  <li className="flex gap-1.5 items-start list-none -ml-0">
                    <MapPin size={14} className="shrink-0 mt-0.5 text-orange-600" />
                    <span>{PICKUP_STORE_ADDRESS}</span>
                  </li>
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-green-600" />
            <h2 className="font-extrabold text-on-surface">Keamanan pembayaran</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            Pembayaran digital diproses melalui gateway Midtrans yang terenkripsi. Platform Daurly
            menerima pembayaran atas nama transaksi konsinyasi — bukan transfer langsung ke penjual perorangan.
          </p>
        </section>
      </div>
    </div>
  );
}
