"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ChevronUp, Search, HelpCircle, User, ShoppingCart, Package, RotateCcw, Store } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Akun & Pendaftaran",
    icon: <User size={16} />,
    items: [
      { q: "Bagaimana cara mendaftar akun di Daurly?", a: "Klik tombol 'Daftar' di sudut kanan atas, isi nama lengkap, email, dan kata sandi. Verifikasi email kamu, dan akun siap digunakan dalam hitungan menit." },
      { q: "Apakah pendaftaran gratis?", a: "Ya, pendaftaran sepenuhnya gratis untuk semua pengguna, baik pembeli maupun penjual. Kami hanya mengenakan biaya layanan kecil untuk setiap transaksi yang berhasil." },
      { q: "Bagaimana Daur Ulang bergabung sebagai mitra konsinyasi?", a: "Daur Ulang tidak mendaftar sendiri lewat website. Hubungi tim Daurly via halaman Kontak atau Customer Service. Setelah kerja sama disepakati, admin mendaftarkan toko dan produk di platform." },
      { q: "Saya lupa kata sandi, apa yang harus dilakukan?", a: "Klik 'Lupa Password?' di halaman login, masukkan email terdaftar, dan kami akan kirimkan link reset kata sandi yang berlaku 30 menit." },
    ],
  },
  {
    category: "Pembelian & Transaksi",
    icon: <ShoppingCart size={16} />,
    items: [
      { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima transfer bank (BCA, BNI, Mandiri, BRI), e-wallet (GoPay, OVO, Dana, ShopeePay), QRIS, kartu kredit/debit Visa/Mastercard, dan cicilan 0% untuk pembelian di atas Rp 500.000." },
      { q: "Apakah transaksi saya aman?", a: "Ya. Kami menggunakan sistem escrow — dana kamu ditahan hingga kamu konfirmasi paket diterima dalam kondisi baik. Seluruh transaksi dilindungi enkripsi SSL 256-bit." },
      { q: "Berapa lama batas waktu pembayaran?", a: "Pesanan yang belum dibayar akan otomatis dibatalkan dalam 24 jam. Kamu akan mendapat notifikasi pengingat sebelum waktu habis." },
      { q: "Bisakah saya membatalkan pesanan?", a: "Pembatalan bisa dilakukan selama status masih 'Menunggu Pembayaran' atau 'Diproses'. Setelah penjual input nomor resi, pembatalan tidak bisa dilakukan melalui sistem." },
    ],
  },
  {
    category: "Pengiriman",
    icon: <Package size={16} />,
    items: [
      { q: "Kurir apa saja yang tersedia?", a: "Kami bekerja sama dengan JNE, J&T Express, SiCepat, GoSend, AnterAja, dan POS Indonesia. Pilihan kurir disesuaikan dengan wilayah dan kebutuhan pengiriman." },
      { q: "Bagaimana cara melacak pesanan saya?", a: "Buka halaman 'Pesanan Saya' di akun kamu, pilih pesanan yang ingin dilacak, lalu klik 'Lacak Pesanan'. Nomor resi akan aktif setelah penjual mengkonfirmasi pengiriman." },
      { q: "Berapa lama estimasi pengiriman?", a: "Tergantung kurir dan lokasi. Jabodetabek 1–2 hari, Jawa 2–3 hari, luar Jawa 3–7 hari, dan wilayah terpencil bisa 7–14 hari kerja." },
      { q: "Paket saya belum datang melewati estimasi, apa yang dilakukan?", a: "Hubungi Tim Bantuan kami dengan menyertakan nomor pesanan dan nomor resi. Kami akan berkoordinasi langsung dengan kurir untuk melacak posisi paket kamu." },
    ],
  },
  {
    category: "Retur & Refund",
    icon: <RotateCcw size={16} />,
    items: [
      { q: "Bagaimana cara mengajukan retur?", a: "Buka halaman 'Pesanan Saya', pilih pesanan yang ingin diretur, klik 'Ajukan Retur', isi alasan dan unggah foto bukti kondisi barang. Retur bisa diajukan dalam 7 hari setelah diterima." },
      { q: "Barang seperti apa yang bisa diretur?", a: "Retur diterima jika: produk tidak sesuai deskripsi/foto, produk rusak/cacat saat diterima, atau terjadi kesalahan pengiriman (produk berbeda). Produk yang sudah dipakai, dimodifikasi, atau dirusak pembeli tidak bisa diretur." },
      { q: "Berapa lama proses refund?", a: "Setelah retur disetujui, refund ke saldo Daurly diproses dalam 1×24 jam. Refund ke kartu/rekening asal memerlukan 3–7 hari kerja tergantung bank/penyedia." },
    ],
  },
  {
    category: "Untuk mitra daur ulang",
    icon: <Store size={16} />,
    items: [
      { q: "Berapa biaya jual di Daurly?", a: "Pendaftaran toko gratis. Biaya layanan 2.5% per transaksi berhasil (lebih rendah dari marketplace lain). Tidak ada biaya listing produk." },
      { q: "Kapan saldo penjualan bisa ditarik?", a: "Saldo masuk setelah pembeli konfirmasi penerimaan. Penarikan bisa dilakukan kapan saja, dengan minimum Rp 50.000, dan diproses dalam 1×24 jam kerja ke rekening terdaftar." },
      { q: "Bagaimana cara meningkatkan penjualan di toko?", a: "Lengkapi deskripsi produk dengan detail, gunakan foto berkualitas tinggi, aktifkan voucher toko, ikuti program flash sale, dan responsif terhadap pertanyaan pembeli untuk meningkatkan rating." },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }

  const filtered = FAQ_DATA.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="bg-surface-container-low py-10">
      <div className="max-w-[800px] mx-auto w-full px-6">
        <nav className="flex items-center gap-2 text-xs text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/bantuan" className="hover:text-primary transition">Pusat Bantuan</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface font-semibold">FAQ</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-3">Pertanyaan yang Sering Diajukan</h1>
          <p className="text-secondary text-sm max-w-md mx-auto">Temukan jawaban atas pertanyaan paling umum tentang Daurly.</p>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-11 pr-4 border border-[#D5CFC9] rounded-xl text-sm font-medium text-on-surface outline-none focus:border-primary transition bg-white shadow-sm"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="bg-white border border-surface-container rounded-xl p-12 text-center">
              <p className="text-secondary text-sm">Tidak ada pertanyaan yang cocok dengan pencarian kamu.</p>
              <button onClick={() => setSearch("")} className="mt-3 text-xs font-bold text-primary hover:underline">Reset pencarian</button>
            </div>
          ) : (
            filtered.map((cat) => (
              <section key={cat.category}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                    {cat.icon}
                  </div>
                  <h2 className="font-extrabold text-on-surface">{cat.category}</h2>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item, idx) => {
                    const id = `${cat.category}-${idx}`;
                    const isOpen = openItems.includes(id);
                    return (
                      <div key={id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${isOpen ? "border-primary" : "border-surface-container"}`}>
                        <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-container-low transition">
                          <span className="font-semibold text-sm text-on-surface pr-4">{item.q}</span>
                          {isOpen ? <ChevronUp size={16} className="text-primary flex-shrink-0" /> : <ChevronDown size={16} className="text-secondary flex-shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5 border-t border-surface-container">
                            <p className="text-sm text-secondary leading-relaxed pt-4">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white border border-surface-container rounded-xl p-7 text-center shadow-sm">
          <p className="font-extrabold text-on-surface mb-2">Tidak menemukan jawaban yang kamu cari?</p>
          <p className="text-sm text-secondary mb-4">Hubungi tim kami langsung dan kami siap membantu.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/kontak" className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition">Hubungi Kami</Link>
            <Link href="/bantuan" className="px-5 py-2.5 border border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary-container transition">Pusat Bantuan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
