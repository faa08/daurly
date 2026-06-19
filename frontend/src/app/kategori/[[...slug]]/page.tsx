"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Utensils, 
  Shirt, 
  Paintbrush, 
  Wrench, 
  Sparkles, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Grid,
  ArrowUpDown,
  ShoppingBag
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";

// Brand Design Constants
const C = {
  primary: "#E8600A",
  primaryDark: "#C24E08",
  primaryPale: "#FFF3ED",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

// Mock Products Database
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Mangkuk Keramik Motif Megamendung Handmade",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    price: 125000,
    image: "/product-keramik.png",
    rating: 4.9,
    sold: 120,
    badge: "Bestseller",
    slug: "mangkuk-keramik-megamendung",
  },
  {
    id: 2,
    name: "Kopi Toraja Arabika 250g Premium Roasted",
    category: "Kuliner",
    categorySlug: "kuliner",
    price: 85000,
    image: "/product-kopi.png",
    rating: 4.8,
    sold: 340,
    badge: "Bestseller",
    slug: "kopi-toraja-arabika-250g",
  },
  {
    id: 3,
    name: "Dompet Kulit Sapi Asli Handmade Cognac Brown",
    category: "Fashion",
    categorySlug: "fashion",
    price: 210000,
    image: "/product-dompet.png",
    rating: 5.0,
    sold: 50,
    badge: "Hot",
    slug: "dompet-kulit-cognac-brown",
  },
  {
    id: 4,
    name: "Paket Perawatan Wajah Alami Ekstrak Kunyit",
    category: "Kecantikan",
    categorySlug: "kecantikan",
    price: 175000,
    image: "/product-skincare.png",
    rating: 4.3,
    sold: 80,
    badge: "Bestseller",
    slug: "skincare-kunyit-alami",
  },
  {
    id: 5,
    name: "Kain Batik Tulis Motif Truntum Klasik",
    category: "Fashion",
    categorySlug: "fashion",
    price: 450000,
    image: "/product-batik.png",
    rating: 5.0,
    sold: 12,
    badge: "Eksklusif",
    slug: "batik-tulis-truntum-klasik",
  },
  {
    id: 6,
    name: "Gelas Keramik Motif Batik Indigo",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    price: 75000,
    image: "/similar-1.png",
    rating: 4.8,
    sold: 120,
    badge: "",
    slug: "gelas-keramik-motif-batik",
  },
  {
    id: 7,
    name: "Piring Dekoratif Batik Parang Cokelat",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    price: 95000,
    image: "/similar-2.png",
    rating: 5.0,
    sold: 45,
    badge: "",
    slug: "piring-dekoratif-batik",
  },
  {
    id: 8,
    name: "Set Wadah Sambel Keramik Handmade",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    price: 120000,
    image: "/similar-3.png",
    rating: 4.7,
    sold: 80,
    badge: "Baru",
    slug: "set-wadah-sambel-keramik",
  },
  {
    id: 9,
    name: "Vas Bunga Keramik Kontemporer Hitam",
    category: "Kerajinan",
    categorySlug: "kerajinan",
    price: 210000,
    image: "/similar-4.png",
    rating: 4.9,
    sold: 30,
    badge: "",
    slug: "vas-bunga-keramik",
  },
  {
    id: 10,
    name: "Sambal Bawang Pedas Asli Surabaya Botol",
    category: "Kuliner",
    categorySlug: "kuliner",
    price: 35000,
    image: "/similar-3.png",
    rating: 4.7,
    sold: 540,
    badge: "Terlaris",
    slug: "sambal-bawang-pedas",
  },
  {
    id: 11,
    name: "Tas Selendang Tenun Tradisional Lombok",
    category: "Fashion",
    categorySlug: "fashion",
    price: 180000,
    image: "/similar-2.png",
    rating: 4.8,
    sold: 32,
    badge: "",
    slug: "tas-selendang-tenun",
  },
  {
    id: 12,
    name: "Jasa Desain Kemasan Produk UMKM Kreatif",
    category: "Jasa",
    categorySlug: "jasa",
    price: 350000,
    image: "/hero-banner-2.png",
    rating: 4.9,
    sold: 40,
    badge: "Populer",
    slug: "jasa-desain-kemasan",
  },
  {
    id: 13,
    name: "Jasa Foto Produk Editorial Profesional",
    category: "Jasa",
    categorySlug: "jasa",
    price: 500000,
    image: "/hero-banner-3.png",
    rating: 5.0,
    sold: 15,
    badge: "",
    slug: "jasa-foto-produk",
  }
];

// Available categories mapping
const CATEGORIES_LIST = [
  { id: "all", name: "Semua Kategori", slug: "", icon: <Grid size={16} /> },
  { id: "kuliner", name: "Kuliner", slug: "kuliner", icon: <Utensils size={16} /> },
  { id: "fashion", name: "Fashion", slug: "fashion", icon: <Shirt size={16} /> },
  { id: "kerajinan", name: "Kerajinan", slug: "kerajinan", icon: <Paintbrush size={16} /> },
  { id: "jasa", name: "Jasa", slug: "jasa", icon: <Wrench size={16} /> },
  { id: "kecantikan", name: "Kecantikan", slug: "kecantikan", icon: <Sparkles size={16} /> },
];

function formatPrice(p: number) {
  return `Rp ${p.toLocaleString("id-ID")}`;
}

export default function CategoryPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  // Unwrap dynamic params
  const resolvedParams = use(params);
  const activeSlug = resolvedParams.slug?.[0] || "";

  const [sortBy, setSortBy] = useState("terpopuler");

  // Find active category
  const currentCategory = CATEGORIES_LIST.find(c => c.slug === activeSlug) || CATEGORIES_LIST[0];

  // Filter products by selected category slug
  const filteredProducts = activeSlug
    ? ALL_PRODUCTS.filter(p => p.categorySlug === activeSlug)
    : ALL_PRODUCTS;

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "harga-asc") return a.price - b.price;
    if (sortBy === "harga-desc") return b.price - a.price;
    if (sortBy === "terlaris") return b.sold - a.sold;
    // Default: "terpopuler"
    return b.rating - a.rating;
  });

  return (
    <div style={{ background: "#FCFCFA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <SearchBar />

      {/* Main Container */}
      <main style={{ flex: 1, paddingBottom: 60 }}>
        <div className="container">
          
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, padding: "20px 0", fontSize: "0.8rem", color: C.textMuted }}>
            <Link href="/" style={{ textDecoration: "none", color: C.textMuted }}>Beranda</Link>
            <ChevronRight size={12} />
            <Link href="/kategori" style={{ textDecoration: "none", color: C.textMuted }}>Kategori</Link>
            {activeSlug && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: C.text, fontWeight: 700 }}>{currentCategory.name}</span>
              </>
            )}
          </nav>

          {/* Banner Hero Kategori */}
          <div style={{
            position: "relative",
            background: `linear-gradient(135deg, ${C.primaryPale} 0%, #FFFFFF 100%)`,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: "40px 48px",
            marginBottom: 32,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 640 }}>
              <span style={{
                display: "inline-block",
                background: C.primary,
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: 4,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Galeri UMKM Pilihan
              </span>
              <h1 style={{
                fontSize: "2.25rem",
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.15,
                margin: "0 0 10px 0",
                fontFamily: "var(--font-jakarta)"
              }}>
                {activeSlug ? `Kategori ${currentCategory.name}` : "Semua Kategori Produk"}
              </h1>
              <p style={{ fontSize: "0.9375rem", color: C.textSec, margin: 0, lineHeight: 1.6 }}>
                Temukan barang kerajinan otentik, hidangan lezat kuliner nusantara, busana lokal tradisional, dan layanan jasa berkualitas langsung dari pelaku UMKM terpercaya.
              </p>
            </div>
            {/* Background design elements */}
            <div style={{
              position: "absolute",
              right: "-40px",
              bottom: "-40px",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: C.primaryPale,
              opacity: 0.8,
              zIndex: 1
            }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 32, alignItems: "start" }}>
            
            {/* Left Column: Sidebar Kategori */}
            <aside style={{
              background: "white",
              border: `1.5px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              position: "sticky",
              top: 88,
              zIndex: 10,
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.text, marginBottom: 16 }}>
                Jelajahi Kategori
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CATEGORIES_LIST.map((cat) => {
                  const isActive = (cat.slug === activeSlug);
                  const productCount = cat.slug 
                    ? ALL_PRODUCTS.filter(p => p.categorySlug === cat.slug).length
                    : ALL_PRODUCTS.length;

                  return (
                    <Link
                      key={cat.id}
                      href={cat.slug ? `/kategori/${cat.slug}` : "/kategori"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: isActive ? C.primaryPale : "transparent",
                        color: isActive ? C.primary : C.textSec,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        transition: "all 0.2s ease"
                      }}
                      className="category-sidebar-link"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: isActive ? C.primary : C.textMuted }}>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <span style={{
                        fontSize: "0.75rem",
                        background: isActive ? C.primary : "#F1ECE8",
                        color: isActive ? "white" : C.textSec,
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontWeight: 700
                      }}>
                        {productCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Right Column: Products Section */}
            <section>
              
              {/* Toolbar: Result count & Sorting */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: `1.5px solid ${C.border}`
              }}>
                <p style={{ fontSize: "0.875rem", color: C.textSec, fontWeight: 500 }}>
                  Menampilkan <strong style={{ color: C.text }}>{sortedProducts.length}</strong> produk terbaik
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ArrowUpDown size={15} color={C.textMuted} />
                  <span style={{ fontSize: "0.8125rem", color: C.textSec, fontWeight: 600 }}>Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: `1.5px solid ${C.borderStrong}`,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: C.text,
                      background: "white",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="terpopuler">Terpopuler</option>
                    <option value="terlaris">Paling Laris</option>
                    <option value="harga-asc">Harga Terendah</option>
                    <option value="harga-desc">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                  gap: 20
                }}>
                  {sortedProducts.map((product) => (
                    <article
                      key={product.id}
                      className="product-card-custom"
                      style={{
                        background: "white",
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s, box-shadow 0.2s"
                      }}
                      id={`kategori-product-${product.id}`}
                    >
                      <Link href={`/produk/${product.slug}`} style={{ textDecoration: "none" }}>
                        <div style={{ position: "relative", aspectRatio: "1/1", width: "100%", background: "#F6F4F0" }}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 50vw, 220px"
                          />
                          {product.badge && (
                            <span style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              background: C.primary,
                              color: "white",
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 4,
                              textTransform: "uppercase"
                            }}>
                              {product.badge}
                            </span>
                          )}
                          <button
                            style={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "white",
                              color: C.primary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                              border: "none",
                              cursor: "pointer"
                            }}
                            className="category-cart-floating"
                            aria-label={`Tambah ${product.name} ke keranjang`}
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </div>

                        <div style={{ padding: 14, display: "flex", flexDirection: "column", flex: 1 }}>
                          <p style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            color: C.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: 4
                          }}>{product.category}</p>
                          <h3 style={{
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            color: C.text,
                            lineHeight: 1.4,
                            marginBottom: 8,
                            height: "2.8em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}>{product.name}</h3>
                          <p style={{
                            fontSize: "0.9375rem",
                            fontWeight: 800,
                            color: C.primary,
                            marginBottom: 8
                          }}>{formatPrice(product.price)}</p>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: C.textMuted, marginTop: "auto" }}>
                            <span style={{ color: C.primary }}>★</span>
                            <strong style={{ color: C.text }}>{product.rating}</strong>
                            <span>|</span>
                            <span>{product.sold} terjual</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 24px",
                  textAlign: "center",
                  background: "white",
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 12
                }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: C.primaryPale,
                    color: C.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16
                  }}>
                    <ShoppingBag size={28} />
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>
                    Belum Ada Produk
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: C.textMuted, maxWidth: 300, margin: "0 0 20px 0", lineHeight: 1.5 }}>
                    Kategori "{currentCategory.name}" saat ini belum memiliki produk terdaftar.
                  </p>
                  <Link href="/kategori" style={{
                    background: C.primary,
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textDecoration: "none"
                  }}>
                    Jelajahi Semua Produk
                  </Link>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
