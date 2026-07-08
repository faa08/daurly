import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Zap,
  Search,
  ShoppingCart,
  CreditCard,
  PackageCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import "./ValueProps.css";

const VALUE_PROPS = [
  {
    icon: Users,
    title: "Fokus Komunitas",
    desc: "Kami menghubungkan langsung pembeli dengan perajin barang daur ulang kreatif untuk mendukung gerakan zero-waste dan circular economy.",
    accentClass: "value-card-accent--community",
  },
  {
    icon: ShieldCheck,
    title: "Kualitas Terjamin",
    desc: "Setiap produk di Daurly telah melewati proses kurasi ketat untuk memastikan produk daur ulang berkualitas tinggi, estetis, dan fungsional.",
    accentClass: "value-card-accent--quality",
  },
  {
    icon: Zap,
    title: "Transaksi Mudah",
    desc: "Sistem pembayaran yang aman dan berbagai pilihan logistik memudahkan setiap langkah belanja Anda dari mana saja.",
    accentClass: "value-card-accent--transaction",
  },
];

const SHOPPING_STEPS = [
  {
    step: 1,
    icon: Search,
    title: "Jelajahi Produk",
    desc: "Cari dan temukan produk daur ulang kreatif favorit Anda dari berbagai kategori.",
  },
  {
    step: 2,
    icon: ShoppingCart,
    title: "Tambah ke Keranjang",
    desc: "Pilih varian, tentukan jumlah, lalu masukkan produk ke keranjang belanja.",
  },
  {
    step: 3,
    icon: CreditCard,
    title: "Checkout & Bayar",
    desc: "Isi alamat pengiriman dan selesaikan pembayaran dengan metode yang aman.",
  },
  {
    step: 4,
    icon: PackageCheck,
    title: "Terima Pesanan",
    desc: "Pesanan dikirim ke alamat Anda. Lacak status pengiriman kapan saja.",
  },
];

export default function ValueProps() {
  return (
    <section className="section-value-props-enhanced">
      <div className="container">
        {/* ── Section Header ── */}
        <div className="value-section-header">
          <span className="value-section-badge">
            <Sparkles size={13} />
            Keunggulan Kami
          </span>
          <h2 className="value-section-title">
            Mengapa harus beli di{" "}
            <span className="value-section-title-accent">Daurly</span>?
          </h2>
          <p className="value-section-subtitle">
            Platform marketplace yang dirancang khusus untuk mendukung produk daur ulang
            berkualitas dan gerakan ramah lingkungan.
          </p>
        </div>

        {/* ── Value Cards ── */}
        <div className="value-props-grid-enhanced">
          {VALUE_PROPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`value-card-enhanced ${item.accentClass}`}>
                <div className="value-card-enhanced-icon">
                  <Icon size={22} strokeWidth={2.25} />
                </div>
                <h3 className="value-title-custom">{item.title}</h3>
                <p className="value-desc-custom">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* ── Customer Flow ── */}
        <div className="customer-flow-panel">
          <div className="customer-flow-header">
            <div>
              <span className="value-section-badge value-section-badge-sm">
                Alur Belanja
              </span>
              <h3 className="customer-flow-title">Cara Belanja di Daurly</h3>
              <p className="customer-flow-subtitle">
                Hanya 4 langkah mudah — dari mencari produk daur ulang hingga pesanan sampai di tangan Anda.
              </p>
            </div>
            <Link href="/kategori" className="customer-flow-cta">
              Mulai Belanja
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="customer-flow-steps">
            {SHOPPING_STEPS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === SHOPPING_STEPS.length - 1;
              return (
                <div key={item.step} className="customer-flow-step">
                  <div className="customer-flow-step-visual">
                    <div className="customer-flow-step-number">{item.step}</div>
                    {!isLast && <div className="customer-flow-connector" aria-hidden="true" />}
                  </div>
                  <div className="customer-flow-step-icon">
                    <Icon size={20} strokeWidth={2.25} />
                  </div>
                  <h4 className="customer-flow-step-title">{item.title}</h4>
                  <p className="customer-flow-step-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
