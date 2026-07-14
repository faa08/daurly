"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_EMAIL_MAILTO } from "@/lib/siteContact";

const SECTIONS = [
  { id: "ketentuan-umum", title: "1. Ketentuan Umum", content: `Dengan mengakses dan menggunakan platform Daurly ("Platform"), Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.\n\nPlatform ini dioperasikan oleh PT Daurly Digital Nusantara dan ditujukan untuk mempertemukan pelaku daur ulang Indonesia dengan pembeli di seluruh wilayah Indonesia.\n\nDaurly berhak mengubah, menambah, atau menghapus syarat dan ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif sejak dipublikasikan di Platform.` },
  { id: "pendaftaran-akun", title: "2. Pendaftaran Akun", content: `Untuk menggunakan fitur tertentu di Platform, Anda wajib mendaftarkan akun dengan ketentuan:\n\n• Memberikan informasi yang akurat, lengkap, dan terkini saat pendaftaran.\n• Berusia minimal 17 tahun atau telah mendapat izin dari wali yang sah.\n• Bertanggung jawab menjaga kerahasiaan kata sandi dan informasi akun.\n• Segera memberitahu Daurly jika terjadi akses tidak sah terhadap akun Anda.\n\nSetiap akun hanya dapat digunakan oleh satu pengguna. Pemindahan akun kepada pihak lain tanpa izin tertulis dilarang.` },
  { id: "transaksi-pembayaran", title: "3. Transaksi & Pembayaran", content: `Seluruh transaksi di Platform dilakukan secara digital:\n\n• Harga produk yang tercantum adalah harga termasuk PPN sesuai regulasi berlaku.\n• Daurly menggunakan sistem escrow — dana pembeli ditahan sementara dan baru diteruskan ke penjual setelah pesanan dikonfirmasi diterima.\n• Pesanan yang belum dibayar dalam 24 jam sejak pembuatan akan otomatis dibatalkan.\n• Biaya layanan platform dibebankan sesuai ketentuan yang berlaku.` },
  { id: "pengiriman", title: "4. Pengiriman", content: `Pengiriman produk diatur dengan ketentuan:\n\n• Penjual wajib memproses pesanan dalam waktu 2×24 jam setelah pembayaran dikonfirmasi.\n• Pilihan kurir dan estimasi pengiriman bersifat estimasi, bukan jaminan.\n• Risiko kerusakan atau kehilangan selama pengiriman ditanggung penjual apabila menggunakan kurir yang disarankan Platform.\n• Penjual wajib mengemas produk dengan baik untuk mencegah kerusakan.` },
  { id: "retur-refund", title: "5. Retur & Refund", content: `Daurly menyediakan perlindungan pembeli:\n\n• Retur dapat diajukan dalam 7 hari setelah pesanan diterima.\n• Alasan retur yang diterima: produk tidak sesuai deskripsi, rusak/cacat, atau kesalahan pengiriman.\n• Produk yang dikembalikan harus dalam kondisi asli dan dilengkapi kemasan asli.\n\nProses refund:\n• Refund ke saldo Platform diproses dalam 1×24 jam kerja.\n• Refund ke metode pembayaran asal diproses dalam 3–7 hari kerja.` },
  { id: "larangan", title: "6. Larangan", content: `Pengguna dilarang:\n\n• Mendaftarkan atau menjual produk ilegal, palsu, berbahaya, atau melanggar hak kekayaan intelektual.\n• Melakukan manipulasi ulasan, rating, atau data transaksi.\n• Menggunakan Platform untuk tujuan penipuan, phishing, atau kegiatan kriminal lainnya.\n• Melakukan spam atau menyebarkan konten pornografi, kekerasan, atau SARA.\n• Membuat lebih dari satu akun untuk menyiasati ketentuan Platform.` },
  { id: "penyelesaian-sengketa", title: "7. Penyelesaian Sengketa", content: `Apabila terjadi sengketa:\n\n1. Negosiasi langsung: Kedua pihak dianjurkan menyelesaikan melalui fitur pesan Platform dalam 3×24 jam.\n\n2. Mediasi Platform: Apabila negosiasi tidak berhasil, salah satu pihak dapat mengajukan mediasi kepada Tim Resolusi Daurly.\n\n3. Jalur hukum: Diselesaikan melalui BANI atau pengadilan negeri yang berwenang di Jakarta Pusat.` },
];

export default function SyaratKetentuanPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); }, { rootMargin: "-20% 0px -60% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[1100px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Syarat & Ketentuan</span>
        </nav>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center"><FileText size={20} className="text-primary" /></div>
            <h1 className="text-3xl font-extrabold text-on-surface">Syarat & Ketentuan</h1>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-2xl">Terakhir diperbarui: <strong>1 Oktober 2023</strong>. Harap baca syarat dan ketentuan sebelum menggunakan layanan Daurly.</p>
        </div>
        <div className="flex gap-10 items-start">
          <aside className="hidden md:block w-60 flex-shrink-0 sticky top-24">
            <div className="bg-white border border-surface-container rounded-xl p-4 shadow-sm">
              <p className="text-xs font-extrabold text-secondary uppercase tracking-wider mb-3 px-2">Daftar Isi</p>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)} className={`text-xs px-3 py-2.5 rounded-lg font-semibold transition leading-snug ${activeSection === s.id ? "bg-primary-container text-primary font-bold" : "text-secondary hover:bg-surface-container hover:text-on-surface"}`}>{s.title}</a>
                ))}
              </nav>
            </div>
          </aside>
          <article className="flex-1 min-w-0 space-y-10">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="bg-white border border-surface-container rounded-xl p-8 shadow-sm scroll-mt-24">
                <h2 className="text-lg font-extrabold text-on-surface mb-4 pb-3 border-b border-surface-container">{s.title}</h2>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">{s.content}</div>
              </section>
            ))}
            <div className="bg-primary-container border border-[#BFDBFE] rounded-xl p-6">
              <p className="text-sm text-primary font-semibold leading-relaxed">Dengan menggunakan Daurly, kamu menyetujui seluruh syarat dan ketentuan di atas. Pertanyaan? Hubungi <a href={CONTACT_EMAIL_MAILTO} className="font-bold underline">{CONTACT_EMAIL}</a> atau Chat Admin.</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
