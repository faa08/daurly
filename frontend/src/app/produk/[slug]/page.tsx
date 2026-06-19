"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  ChevronRight,
  Store,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";

const THUMBNAILS = [
  "/product-detail-keramik.png",
  "/product-keramik.png",
  "/similar-1.png",
  "/similar-2.png",
];

const COLORS = [
  { name: "Biru Batik", hex: "#2563EB" },
  { name: "Cokelat Tanah", hex: "#92400E" },
  { name: "Hijau Sage", hex: "#166534" },
];

const SIZES = ["12 cm", "15 cm", "18 cm"];

const SIMILAR_PRODUCTS = [
  { id: 1, name: "Gelas Keramik Motif Batik Indigo", price: 75000, rating: 4.8, sold: 120, image: "/similar-1.png" },
  { id: 2, name: "Piring Dekoratif Batik Parang", price: 95000, rating: 5.0, sold: 45, image: "/similar-2.png" },
  { id: 3, name: "Set Wadah Sambel Keramik", price: 120000, rating: 4.7, sold: 80, image: "/similar-3.png" },
  { id: 4, name: "Vas Bunga Keramik Kontemporer", price: 210000, rating: 4.9, sold: 30, image: "/similar-4.png" },
  { id: 5, name: "Teko Keramik Handmade Tradisional", price: 320000, rating: 4.6, sold: 15, image: "/similar-5.png" },
];

function formatPrice(p: number) {
  return `Rp ${p.toLocaleString("id-ID")}`;
}

export default function ProductDetailPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState(0);

  return (
    <>
      <Navbar />
      <SearchBar />

      {/* Main content area */}
      <main style={{ background: "#FCFCFA", minHeight: "60vh", paddingBottom: 60 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* ── Breadcrumb ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 0 20px", fontSize: "0.8rem", color: "#8E8680" }}>
            <Link href="/" style={{ color: "#8E8680", textDecoration: "none" }}>Beranda</Link>
            <ChevronRight size={13} />
            <Link href="/kategori/kerajinan" style={{ color: "#8E8680", textDecoration: "none" }}>Kerajinan Tangan</Link>
            <ChevronRight size={13} />
            <span style={{ color: "#1F1B18", fontWeight: 600 }}>Mangkuk Keramik Motif Batik</span>
          </nav>

          {/* ── Main Product Card ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            gap: 32,
            background: "white",
            border: "1px solid #EAE5E0",
            borderRadius: 12,
            padding: 28,
            marginBottom: 24,
          }}>

            {/* Left: Image Gallery */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Main Image */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1",
                borderRadius: 10,
                overflow: "hidden",
                background: "#F8F6F4",
                border: "1px solid #EAE5E0",
              }}>
                <Image
                  src={THUMBNAILS[activeImg]}
                  alt="Mangkuk Keramik Motif Batik"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              {/* Thumbnails */}
              <div style={{ display: "flex", gap: 8 }}>
                {THUMBNAILS.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      position: "relative",
                      width: 72,
                      height: 72,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: activeImg === i ? "2px solid #E8600A" : "2px solid transparent",
                      cursor: "pointer",
                      background: "#F8F6F4",
                      padding: 0,
                      flexShrink: 0,
                      transition: "border-color 0.15s",
                    }}
                  >
                    <Image src={src} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Badge */}
              <span style={{
                display: "inline-block",
                background: "#E8600A",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 3,
                letterSpacing: "0.05em",
                width: "fit-content",
              }}>PRODUK UNGGULAN</span>

              {/* Product Name */}
              <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "#1F1B18", lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>
                Mangkuk Keramik Motif Batik
              </h1>

              {/* Rating Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#5C5550", fontWeight: 600 }}>4.8 | 124 Ulasan</span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>·</span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>Terjual 380+</span>
              </div>

              {/* Price */}
              <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#E8600A", letterSpacing: "-0.02em" }}>
                Rp 125.000
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#EAE5E0" }} />

              {/* Color Picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", margin: 0 }}>Warna Pilihan</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveColor(i)}
                      title={c.name}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c.hex,
                        border: "2px solid transparent",
                        cursor: "pointer",
                        outline: "none",
                        boxShadow: activeColor === i ? `0 0 0 3px white, 0 0 0 5px #E8600A` : "none",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", margin: 0 }}>Ukuran (Diameter)</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {SIZES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSize(i)}
                      style={{
                        height: 34,
                        padding: "0 16px",
                        borderRadius: 6,
                        border: activeSize === i ? "1.5px solid #E8600A" : "1.5px solid #D5CFC9",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: activeSize === i ? "#E8600A" : "#5C5550",
                        background: activeSize === i ? "#FFF3ED" : "white",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: "0.875rem", color: "#5C5550", lineHeight: 1.7, margin: 0 }}>
                Mangkuk keramik eksklusif yang dibuat oleh perajin lokal dengan teknik pembakaran suhu tinggi untuk daya tahan maksimal. Dihiasi dengan motif batik klasik yang dilukis tangan menggunakan bahan pewarna alami yang aman untuk makanan (Food Grade). Cocok sebagai pelengkap meja makan mewah atau hadiah spesial.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  id="add-to-cart"
                  style={{
                    flex: 1,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    border: "2px solid #E8600A",
                    borderRadius: 8,
                    color: "#E8600A",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    background: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <ShoppingCart size={18} />
                  Tambah ke Keranjang
                </button>
                <button
                  id="buy-now"
                  style={{
                    flex: 1,
                    height: 48,
                    background: "#E8600A",
                    color: "white",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "inherit",
                  }}
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* ── Info + Seller Grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, marginBottom: 40, alignItems: "start" }}>

            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Product Info Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", marginBottom: 16, margin: "0 0 16px 0" }}>Informasi Produk</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 140px 1fr", gap: 8, fontSize: "0.8125rem" }}>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Bahan</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>Keramik Porselen</span>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Asal Produk</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>Kasongan, Yogyakarta</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 140px 1fr", gap: 8, fontSize: "0.8125rem" }}>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Berat</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>450 gram</span>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Ketahanan</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>Microwave &amp; Dishwasher Safe</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.65, paddingTop: 12, borderTop: "1px solid #EAE5E0", margin: 0 }}>
                  Setiap produk unik karena dikerjakan secara manual oleh tangan terampil perajin UMKM kami. Dengan membeli produk ini, Anda turut berkontribusi dalam melestarikan budaya batik dan mendukung ekonomi kreatif lokal Indonesia.
                </p>
              </div>

              {/* Reviews Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>Ulasan Pembeli</h2>
                  <Link href="#" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#E8600A", textDecoration: "none" }}>Lihat Semua</Link>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, #E8600A, #C24E08)",
                    color: "white", fontSize: "0.875rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>BN</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F1B18" }}>Budi Nugraha</span>
                      <span style={{ fontSize: "0.75rem", color: "#8E8680" }}>2 hari yang lalu</span>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
                      &quot;Barangnya sangat bagus, packing sangat aman dengan bubble wrap tebal. Motif batiknya rapi dan warnanya persis seperti di foto. Sangat direkomendasikan!&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Seller Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: "linear-gradient(135deg, #92400E, #78350F)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Store size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>Griya Keramik Kasongan</p>
                    <p style={{ fontSize: "0.75rem", color: "#8E8680", marginTop: 2, margin: "2px 0 0 0" }}>Aktif 5 menit yang lalu</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: "#E8600A" }}>
                  <ShieldCheck size={14} color="#E8600A" />
                  <span>Pelapak Terverifikasi</span>
                </div>
                <Link
                  href="/toko/griya-keramik"
                  style={{
                    display: "block",
                    textAlign: "center",
                    height: 38,
                    lineHeight: "38px",
                    border: "1.5px solid #D5CFC9",
                    borderRadius: 6,
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: "#1F1B18",
                    textDecoration: "none",
                  }}
                >
                  Kunjungi Toko
                </Link>
              </div>

              {/* Promo Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18" }}>
                  <Tag size={14} color="#E8600A" />
                  <span>Promo Hari Ini</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, margin: 0 }}>
                  Gunakan kode <strong style={{ color: "#E8600A" }}>LOKALBANGGA</strong> untuk diskon 10% khusus produk kerajinan tangan.
                </p>
                <button style={{
                  height: 38,
                  background: "#E8600A",
                  color: "white",
                  borderRadius: 6,
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                }}>Klaim Voucher</button>
              </div>
            </div>
          </div>

          {/* ── Similar Products ── */}
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", marginBottom: 20 }}>Produk Serupa</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {SIMILAR_PRODUCTS.map((p) => (
                <Link
                  key={p.id}
                  href={`/produk/similar-${p.id}`}
                  style={{
                    background: "white",
                    border: "1px solid #EAE5E0",
                    borderRadius: 12,
                    overflow: "hidden",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "1", background: "#F8F6F4" }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <h3 style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#1F1B18",
                      lineHeight: 1.35,
                      marginBottom: 6,
                      margin: "0 0 6px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.7em",
                    }}>{p.name}</h3>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#E8600A", marginBottom: 6, margin: "0 0 6px 0" }}>
                      {formatPrice(p.price)}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#8E8680" }}>
                      <span style={{ color: "#E8600A", fontSize: "0.8rem" }}>★</span>
                      <span>{p.rating}</span>
                      <span style={{ color: "#D5CFC9" }}>·</span>
                      <span>{p.sold} terjual</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
