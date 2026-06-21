"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, HeadphonesIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONTACT_CARDS = [
  { icon: <Mail size={20} />, title: "Email", value: "support@pelataranumkm.id", sub: "Balas dalam 1×24 jam kerja", href: "mailto:support@pelataranumkm.id" },
  { icon: <Phone size={20} />, title: "Telepon", value: "+62 21 5500 1234", sub: "Senin–Jumat, 09.00–17.00 WIB", href: "tel:+622155001234" },
  { icon: <MessageSquare size={20} />, title: "Live Chat", value: "Chat Langsung", sub: "Tersedia di halaman bantuan", href: "/bantuan" },
  { icon: <HeadphonesIcon size={20} />, title: "Pusat Bantuan", value: "Lihat FAQ", sub: "Temukan jawaban cepat", href: "/bantuan" },
];

export default function KontakPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1400);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Navbar />

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Hubungi Kami</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-on-surface mb-3">Hubungi Kami</h1>
          <p className="text-secondary text-sm leading-relaxed max-w-lg mx-auto">
            Ada pertanyaan, masukan, atau butuh bantuan? Tim kami siap membantu kamu.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {CONTACT_CARDS.map((c) => (
            <a key={c.title} href={c.href} className="bg-white border border-surface-container rounded-xl p-5 shadow-sm text-center hover:border-primary hover:shadow-md transition group">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition">
                {c.icon}
              </div>
              <p className="font-extrabold text-xs text-on-surface mb-1">{c.title}</p>
              <p className="text-sm font-bold text-primary mb-0.5">{c.value}</p>
              <p className="text-[10px] text-secondary">{c.sub}</p>
            </a>
          ))}
        </div>

        {/* Form + Info */}
        <div className="grid md:grid-cols-5 gap-8">

          {/* Form */}
          <div className="md:col-span-3 bg-white border border-surface-container rounded-xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-on-surface mb-6">Kirim Pesan</h2>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input type="text" required placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Email</label>
                    <input type="email" required placeholder="nama@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Subjek</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition bg-white">
                    <option value="">Pilih subjek...</option>
                    <option>Pertanyaan Umum</option>
                    <option>Masalah Transaksi</option>
                    <option>Masalah Akun</option>
                    <option>Laporan Bug</option>
                    <option>Kerjasama</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">Pesan</label>
                  <textarea required rows={5} placeholder="Tulis pesan kamu di sini..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-[#D5CFC9] rounded-lg px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary transition resize-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? "Mengirim..." : <><Send size={15} />Kirim Pesan</>}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center gap-5 py-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={36} className="text-green-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-on-surface mb-2">Pesan Terkirim!</h3>
                  <p className="text-sm text-secondary leading-relaxed max-w-xs">
                    Terima kasih, <strong>{form.name}</strong>. Kami akan membalas ke <strong>{form.email}</strong> dalam 1×24 jam kerja.
                  </p>
                </div>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="px-6 py-2.5 border border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary-container transition">
                  Kirim Pesan Lain
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-on-surface">Informasi Kantor</h3>
              <div className="space-y-4 text-sm text-secondary">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-on-surface">Alamat</p>
                    <p>Jl. Sudirman No. 100, Kebayoran Baru, Jakarta Selatan 12190</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-on-surface">Jam Operasional</p>
                    <p>Senin – Jumat: 09.00 – 17.00 WIB</p>
                    <p>Sabtu: 09.00 – 13.00 WIB</p>
                    <p>Minggu & Libur Nasional: Tutup</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-on-surface">Email</p>
                    <p>support@pelataranumkm.id</p>
                    <p>partnership@pelataranumkm.id</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-container border border-[#BFDBFE] rounded-xl p-5">
              <p className="text-xs font-extrabold text-primary uppercase tracking-wider mb-2">Butuh Bantuan Cepat?</p>
              <p className="text-sm text-primary leading-relaxed mb-3">Cek Pusat Bantuan kami untuk jawaban atas pertanyaan yang paling sering ditanyakan.</p>
              <Link href="/bantuan" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition">
                Kunjungi Pusat Bantuan
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
