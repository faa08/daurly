"use client";

import { useState, use, useEffect } from "react";
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
import CategoryHero from "@/components/CategoryHero";
import { fetchCategoryHero, type SiteBanner } from "@/backend/bannerService";
import { getCategoryHeroConfig } from "@/data/categoryHero";
import { productService } from "@/backend/productService";
import { parseProductImg, ProductGridImage, productToCard } from "@/lib/productUi";
import { cartService } from "@/backend/cartService";
import { authService } from "@/backend/authService";

// Brand Design Constants
const C = {
  primary: "#1D4ED8",
  primaryDark: "#1E40AF",
  primaryPale: "#EFF6FF",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

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

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("terpopuler");
  const [categoryHero, setCategoryHero] = useState<SiteBanner | null>(null);

  useEffect(() => {
    fetchCategoryHero(activeSlug).then(setCategoryHero);
  }, [activeSlug]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productService.getProducts({ publicOnly: true, limit: 80 });
        const mapped = data.map((p: any) => {
          const card = productToCard(p);
          return {
            ...card,
            categorySlug: p.categorySlug || "kerajinan",
            badge: p.stok === 0 ? "Habis" : "Unggulan",
            rating: 4.8,
            sold: Math.floor(Math.random() * 25) + 5,
          };
        });
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to load category products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Find active category
  const currentCategory = CATEGORIES_LIST.find(c => c.slug === activeSlug) || CATEGORIES_LIST[0];
  const heroConfig = getCategoryHeroConfig(activeSlug);
  const heroTitle =
    categoryHero?.title_line1 ||
    (activeSlug ? `Kategori ${currentCategory.name}` : "Semua Kategori Produk");
  const heroDescription = categoryHero?.description || heroConfig.description;
  const heroImage = categoryHero?.image_url || heroConfig.backgroundImage;
  const heroPosition = categoryHero?.image_position || heroConfig.backgroundPosition;
  const heroBadge = categoryHero?.badge || "Galeri UMKM Pilihan";

  // Filter products by selected category slug
  const filteredProducts = activeSlug
    ? products.filter(p => p.categorySlug === activeSlug)
    : products;

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "harga-asc") return a.price - b.price;
    if (sortBy === "harga-desc") return b.price - a.price;
    if (sortBy === "terlaris") return b.sold - a.sold;
    // Default: "terpopuler"
    return b.rating - a.rating;
  });

  const getCategoryProductCount = (slug: string) =>
    slug ? products.filter((p) => p.categorySlug === slug).length : products.length;

  const visibleCategories = CATEGORIES_LIST.filter(
    (cat) => !cat.slug || getCategoryProductCount(cat.slug) > 0
  );

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
          <CategoryHero
            badge={heroBadge}
            title={heroTitle}
            description={heroDescription}
            backgroundImage={heroImage}
            backgroundPosition={heroPosition}
          />

          <div className="catalog-layout catalog-layout--wide">
            <aside className="catalog-sidebar" style={{
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
                {visibleCategories.map((cat) => {
                  const isActive = (cat.slug === activeSlug);
                  const productCount = getCategoryProductCount(cat.slug);

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
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 24px" }}>
                  <p style={{ color: C.textSec, fontWeight: 600 }}>Memuat produk...</p>
                </div>
              ) : sortedProducts.length > 0 ? (
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
                          <ProductGridImage src={product.image} alt={product.name} sizes="(max-width: 768px) 50vw, 220px" />
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
                            onClick={async (e) => {
                              e.preventDefault();
                              const user = authService.getCurrentUser();
                              if (!user) {
                                alert("Silakan masuk terlebih dahulu untuk berbelanja.");
                                window.location.href = "/masuk";
                                return;
                              }
                              const result = await cartService.addToCart(user.id_user, product.id, 1);
                              if (result.ok) {
                                alert("Produk berhasil ditambahkan ke keranjang!");
                              } else {
                                alert(result.error || "Gagal menambahkan ke keranjang.");
                              }
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
                          }}>{product.priceRange || formatPrice(product.price)}</p>
                          
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
                    Kategori &quot;{currentCategory.name}&quot; saat ini belum memiliki produk terdaftar.
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
