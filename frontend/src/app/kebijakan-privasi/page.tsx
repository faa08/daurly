"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  { id: "data-dikumpulkan", title: "1. Data yang Kami Kumpulkan", content: `Pelataran UMKM mengumpulkan data pribadi dalam rangka menyediakan layanan marketplace yang optimal:\n\nData Identitas:\n• Nama lengkap, nomor telepon, alamat email, dan tanggal lahir.\n• Foto profil (opsional).\n• Nomor KTP/identitas resmi (untuk verifikasi penjual).\n\nData Transaksi:\n• Riwayat pembelian dan penjualan.\n• Data pembayaran (disimpan terenkripsi).\n• Alamat pengiriman dan penerima.\n\nData Penggunaan:\n• Log aktivitas, halaman yang dikunjungi, fitur yang digunakan.\n• Alamat IP, tipe perangkat, sistem operasi, dan browser.` },
  { id: "penggunaan-data", title: "2. Penggunaan Data", content: `Data yang kami kumpulkan digunakan untuk:\n\nOperasional Layanan:\n• Memproses pendaftaran akun dan verifikasi identitas.\n• Memfasilitasi transaksi antara pembeli dan penjual.\n• Memproses pembayaran dan pengembalian dana.\n\nPeningkatan Platform:\n• Menganalisis pola penggunaan untuk meningkatkan fitur.\n• Mendeteksi dan mencegah penipuan serta aktivitas mencurigakan.\n\nKomunikasi:\n• Mengirimkan notifikasi transaksi dan pembaruan pesanan.\n• Menyampaikan informasi promosi relevan (dengan persetujuan Anda).` },
  { id: "berbagi-data", title: "3. Berbagi Data dengan Pihak Ketiga", content: `Pelataran UMKM tidak menjual data pribadi Anda. Data dapat dibagikan dalam kondisi:\n\nMitra Layanan:\n• Penyedia layanan pembayaran untuk memproses transaksi.\n• Perusahaan kurir dan logistik untuk pengiriman produk.\n• Penyedia infrastruktur cloud yang terikat perjanjian kerahasiaan.\n\nSesama Pengguna:\n• Nama dan ulasan yang bersifat publik dapat dilihat pengguna lain.\n• Alamat pengiriman dibagikan kepada penjual yang relevan.\n\nKewajiban Hukum:\n• Kepada otoritas berwenang apabila diwajibkan oleh hukum.` },
  { id: "keamanan-data", title: "4. Keamanan Data", content: `Kami menerapkan langkah keamanan teknis dan organisasi:\n\n• Enkripsi SSL/TLS 256-bit untuk semua transmisi data.\n• Data sensitif disimpan dalam format terenkripsi.\n• Firewall dan deteksi intrusi aktif memantau ancaman keamanan.\n• Pengujian keamanan (penetration testing) dilakukan berkala.\n• Akses data dibatasi dengan prinsip least privilege.\n• Autentikasi dua faktor (2FA) tersedia untuk semua akun.\n\nPengguna akan diberitahu dalam 72 jam apabila terjadi pelanggaran data yang berdampak pada informasi mereka.` },
  { id: "cookie", title: "5. Cookie & Teknologi Pelacakan", content: `Platform menggunakan cookie dan teknologi serupa:\n\nJenis Cookie:\n• Cookie Esensial: Diperlukan untuk operasional dasar (login, keranjang). Tidak dapat dinonaktifkan.\n• Cookie Analitik: Membantu kami memahami cara pengguna berinteraksi dengan Platform.\n• Cookie Preferensi: Menyimpan pengaturan seperti bahasa dan tema.\n• Cookie Pemasaran: Iklan relevan (hanya dengan persetujuan Anda).\n\nAnda dapat mengatur preferensi cookie melalui pengaturan browser. Menonaktifkan cookie tertentu dapat mempengaruhi fungsionalitas Platform.` },
  { id: "hak-pengguna", title: "6. Hak Pengguna", content: `Sebagai pengguna, Anda memiliki hak:\n\n• Hak Akses: Meminta salinan data pribadi yang kami simpan.\n• Hak Koreksi: Memperbarui data yang tidak akurat melalui pengaturan akun.\n• Hak Penghapusan: Meminta penghapusan akun dan data Anda.\n• Hak Portabilitas: Mendapatkan data dalam format terstruktur.\n• Hak Keberatan: Menolak pemrosesan data untuk pemasaran langsung.\n\nUntuk mengajukan permintaan, hubungi privacy@pelataranumkm.id. Kami merespons dalam 30 hari kerja.` },
  { id: "retensi-kontak", title: "7. Retensi Data & Kontak", content: `Retensi Data:\nKami menyimpan data pribadi Anda selama akun aktif dan hingga 5 tahun setelah penutupan akun untuk keperluan akuntansi dan kepatuhan hukum.\n\nPerubahan Kebijakan:\nPengguna akan diberitahu minimal 14 hari sebelum perubahan material berlaku.\n\nHubungi Kami:\n• Email: privacy@pelataranumkm.id\n• Tim Privasi: Data Protection Officer Pelataran UMKM\n• Alamat: Jl. Sudirman No. 100, Jakarta Selatan 12190` },
];

export default function KebijakanPrivasiPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); }, { rootMargin: "-20% 0px -60% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Navbar />
      <main className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-10">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">Kebijakan Privasi</span>
        </nav>
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center"><ShieldCheck size={20} className="text-primary" /></div>
            <h1 className="text-3xl font-extrabold text-on-surface">Kebijakan Privasi</h1>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-2xl">Terakhir diperbarui: <strong>1 Oktober 2023</strong>. Kebijakan ini menjelaskan bagaimana Pelataran UMKM mengumpulkan, menggunakan, dan melindungi data pribadi Anda.</p>
        </div>
        <div className="flex gap-10 items-start">
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24">
            <div className="bg-white border border-surface-container rounded-xl p-4 shadow-sm">
              <p className="text-xs font-extrabold text-secondary uppercase tracking-wider mb-3 px-2">Daftar Isi</p>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)} className={`text-xs px-3 py-2.5 rounded-lg font-semibold transition leading-snug ${activeSection === s.id ? "bg-primary-container text-primary font-bold" : "text-secondary hover:bg-surface-container hover:text-on-surface"}`}>{s.title}</a>
                ))}
              </nav>
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-green-600" /><span className="text-xs font-extrabold text-green-700">Data Terlindungi</span></div>
              <p className="text-xs text-green-600 leading-relaxed">Kami tidak pernah menjual data Anda kepada pihak ketiga.</p>
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
              <p className="text-sm text-primary font-semibold leading-relaxed">Dengan menggunakan Pelataran UMKM, Anda menyetujui pengumpulan dan penggunaan data sesuai kebijakan ini. Pertanyaan? Hubungi <a href="mailto:privacy@pelataranumkm.id" className="font-bold underline">privacy@pelataranumkm.id</a>.</p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
