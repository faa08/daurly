"use client";

import Link from "next/link";
import { ChevronRight, Truck, MessageSquare, Store, Package, CheckCircle2 } from "lucide-react";
import { PICKUP_STORE_ADDRESS } from "@/lib/checkoutConstants";

const DIGITAL_STEPS = [
  { num: "1", title: "Bayar Digital", desc: "Selesaikan pembayaran via Midtrans saat checkout." },
  { num: "2", title: "Admin Hubungi", desc: "Setelah pembayaran sukses, admin menghubungi Anda lewat Chat Pengiriman." },
  { num: "3", title: "Konfirmasi Alamat", desc: "Pastikan alamat & jadwal penerimaan sesuai di chat dengan admin." },
  { num: "4", title: "Paket Dikirim", desc: "Tim platform mengatur pengiriman. Status bisa dipantau di Pesanan Saya." },
  { num: "5", title: "Pesanan Selesai", desc: "Klik 'Pesanan Selesai' setelah barang diterima — lalu bisa ulas atau ajukan return." },
];

const PICKUP_STEPS = [
  { num: "1", title: "Pilih Ambil di Toko", desc: "Checkout dengan metode pickup, tanpa ongkir." },
  { num: "2", title: "Datang ke Toko", desc: "Kunjungi lokasi Daurly di Cilegon." },
  { num: "3", title: "Bayar & Ambil", desc: "Bayar di tempat dan bawa pulang barang Anda." },
  { num: "4", title: "Tandai Selesai", desc: "Konfirmasi pesanan selesai di akun untuk menutup transaksi." },
];

export default function InfoPengirimanPage() {
  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[1100px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Pengiriman & Chat</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface">Pengiriman & Chat Admin</h1>
          </div>
          <p className="text-secondary text-sm max-w-2xl leading-relaxed">
            Di model konsinyasi Daurly, <strong>pengiriman diatur oleh platform</strong> — bukan dikirim
            sendiri oleh perajin/penjual. Setelah bayar digital, admin koordinasi lewat chat.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={18} className="text-primary" />
              <h2 className="text-lg font-extrabold text-on-surface">Alur — Bayar Digital + Kirim</h2>
            </div>
            <div className="space-y-4">
              {DIGITAL_STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{step.title}</p>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-secondary">
              Chat pengiriman: <Link href="/account/orders" className="text-primary font-bold">Pesanan Saya</Link> → tombol Chat Pengiriman.
            </p>
          </section>

          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Store size={18} className="text-orange-600" />
              <h2 className="text-lg font-extrabold text-on-surface">Alur — Ambil di Toko (Pickup)</h2>
            </div>
            <div className="space-y-4 mb-5">
              {PICKUP_STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{step.title}</p>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-secondary flex gap-2 items-start bg-orange-50 border border-orange-100 rounded-lg p-4">
              <Package size={16} className="shrink-0 text-orange-600 mt-0.5" />
              <span>{PICKUP_STORE_ADDRESS}</span>
            </p>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex gap-3">
            <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-on-surface leading-relaxed">
              <p className="font-bold mb-1">Estimasi pengiriman</p>
              <p className="text-secondary text-xs">
                Jadwal & kurir dikonfirmasi admin di chat setelah pembayaran. Estimasi tergantung lokasi
                tujuan — biasanya 2–7 hari kerja untuk Jawa, lebih lama untuk luar Jawa.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
