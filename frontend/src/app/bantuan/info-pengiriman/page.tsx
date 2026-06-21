"use client";

import Link from "next/link";
import { ChevronRight, Truck, Clock, MapPin, Package, ShieldCheck, AlertCircle } from "lucide-react";

const COURIERS = [
  { name: "JNE", types: ["REG (2-3 hari)", "YES (1-2 hari)", "OKE (3-5 hari)"] },
  { name: "J&T Express", types: ["Express (2-4 hari)", "EZ (3-5 hari)"] },
  { name: "SiCepat", types: ["Halu (1-2 hari)", "GOKIL (2-4 hari)", "Best (3-5 hari)"] },
  { name: "GoSend", types: ["Instant (2-4 jam)", "SameDay (dalam hari)"] },
  { name: "AnterAja", types: ["Next Day (1 hari)", "Regular (2-3 hari)"] },
  { name: "POS Indonesia", types: ["Kilat Khusus (3-5 hari)", "Biasa (7-14 hari)"] },
];

const STEPS = [
  { num: "1", title: "Pesan & Bayar", desc: "Setelah pembayaran dikonfirmasi, penjual mendapat notifikasi untuk memproses pesanan." },
  { num: "2", title: "Penjual Kemas", desc: "Penjual wajib mengemas dan menyerahkan paket ke kurir dalam 2×24 jam kerja." },
  { num: "3", title: "Kurir Jemput", desc: "Kurir menjemput paket dari toko dan memulai proses pengiriman." },
  { num: "4", title: "Dalam Perjalanan", desc: "Kamu bisa memantau status pengiriman via nomor resi di halaman 'Pesanan Saya'." },
  { num: "5", title: "Paket Tiba", desc: "Setelah paket diterima, konfirmasi penerimaan agar penjual mendapat pembayaran." },
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
          <span className="text-on-surface font-semibold">Informasi Pengiriman</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center"><Truck size={20} className="text-primary" /></div>
            <h1 className="text-3xl font-extrabold text-on-surface">Informasi Pengiriman</h1>
          </div>
          <p className="text-secondary text-sm max-w-2xl">Semua yang perlu kamu ketahui tentang pengiriman pesanan di Pelataran UMKM.</p>
        </div>

        <div className="space-y-8">
          {/* Alur Pengiriman */}
          <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-on-surface mb-6">Alur Pengiriman</h2>
            <div className="flex flex-col md:flex-row gap-0">
              {STEPS.map((step, i) => (
                <div key={step.num} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1 relative">
                  <div className="flex flex-col md:flex-row items-center gap-0 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">{step.num}</div>
                    {i < STEPS.length - 1 && <div className="hidden md:block flex-1 h-0.5 bg-primary/30 min-w-[20px]" />}
                  </div>
                  <div className="md:text-center pb-6 md:pb-0 md:px-2">
                    <p className="font-extrabold text-sm text-on-surface mb-1">{step.title}</p>
                    <p className="text-xs text-secondary leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Estimasi Waktu & Kurir */}
          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <Clock size={18} className="text-primary" />
                <h2 className="text-lg font-extrabold text-on-surface">Estimasi Waktu</h2>
              </div>
              <div className="space-y-3">
                {[
                  { zone: "Jabodetabek", time: "1–2 hari kerja" },
                  { zone: "Jawa (luar Jabodetabek)", time: "2–3 hari kerja" },
                  { zone: "Bali, Sumatra, Kalimantan", time: "3–5 hari kerja" },
                  { zone: "Sulawesi, NTB, NTT", time: "4–7 hari kerja" },
                  { zone: "Papua, Maluku", time: "7–14 hari kerja" },
                ].map((item) => (
                  <div key={item.zone} className="flex justify-between items-center py-2.5 border-b border-surface-container last:border-0">
                    <div className="flex items-center gap-2.5 text-sm text-on-surface font-medium">
                      <MapPin size={13} className="text-secondary flex-shrink-0" />{item.zone}
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary-container px-2.5 py-1 rounded-full">{item.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-secondary mt-4 leading-relaxed">* Estimasi tidak termasuk hari libur nasional dan di luar kendali kami.</p>
            </section>

            <section className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <Package size={18} className="text-primary" />
                <h2 className="text-lg font-extrabold text-on-surface">Kurir Mitra</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COURIERS.map((c) => (
                  <div key={c.name} className="border border-surface-container rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-extrabold text-sm text-on-surface">{c.name}</p>
                    </div>
                    <div className="space-y-0.5">
                      {c.types.map((t) => <p key={t} className="text-[10px] text-secondary">• {t}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Kebijakan & Tips */}
          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={18} className="text-primary" />
                <h2 className="font-extrabold text-on-surface">Perlindungan Pengiriman</h2>
              </div>
              <ul className="space-y-3 text-sm text-secondary">
                {["Semua pesanan dilindungi sistem escrow — dana baru diteruskan ke penjual setelah kamu konfirmasi terima.", "Asuransi pengiriman tersedia untuk barang bernilai di atas Rp 500.000.", "Jika paket hilang atau rusak oleh kurir, ajukan klaim melalui halaman Bantuan.", "Masa klaim maksimal 3×24 jam setelah status 'Terkirim' muncul."].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-surface-container rounded-xl p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={18} className="text-primary" />
                <h2 className="font-extrabold text-on-surface">Tips Packing Seller</h2>
              </div>
              <ul className="space-y-3 text-sm text-secondary">
                {["Gunakan bubble wrap minimal 2 lapis untuk barang pecah belah.", "Isi celah kosong dalam kotak dengan kertas koran atau foam untuk mencegah pergeseran.", "Tempelkan label fragile untuk barang rentan kerusakan.", "Pastikan alamat pengiriman tercetak jelas dan tidak mudah hilang.", "Foto kondisi barang sebelum dikemas sebagai bukti pengiriman."].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="bg-primary-container border border-[#BFDBFE] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-primary mb-1">Masih ada pertanyaan?</p>
              <p className="text-sm text-primary/80">Tim kami siap membantu kamu 24/7 melalui Pusat Bantuan.</p>
            </div>
            <Link href="/bantuan" className="flex-shrink-0 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">
              Hubungi Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
