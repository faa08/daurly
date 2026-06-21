import Link from "next/link";
import { Home, Search, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-lg w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
              <AlertCircle size={40} className="text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-8xl font-extrabold text-primary leading-none mb-3 select-none">404</h1>
          <h2 className="text-2xl font-bold text-on-surface mb-3">Halaman Tidak Ditemukan</h2>
          <p className="text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau tidak pernah ada. Cek kembali alamat URL atau kembali ke beranda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">
              <Home size={16} /> Kembali ke Beranda
            </Link>
            <Link href="/kategori" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-on-surface text-on-surface font-bold text-sm rounded-lg hover:bg-surface-container transition">
              <Search size={16} /> Cari Produk
            </Link>
          </div>
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-[#EAE5E0]" />
            <span className="text-xs text-secondary font-semibold uppercase tracking-wider">atau jelajahi</span>
            <div className="flex-1 h-px bg-[#EAE5E0]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Kuliner", href: "/kategori/kuliner" },
              { label: "Fashion", href: "/kategori/fashion" },
              { label: "Kerajinan", href: "/kategori/kerajinan" },
              { label: "Kecantikan", href: "/kategori/kecantikan" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-2.5 bg-white border border-surface-container rounded-lg text-sm font-semibold text-secondary hover:text-primary hover:border-primary transition text-center">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
