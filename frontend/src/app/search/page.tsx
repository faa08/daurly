"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, ShoppingCart, ChevronRight, Store, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { productService } from "@/backend/productService";
import { sellerService, type Seller, type StoreStats } from "@/backend/sellerService";
import { cartService } from "@/backend/cartService";
import { authService } from "@/backend/authService";
import { productToCard, type ProductCard, ProductGridImage } from "@/lib/productUi";

const C = { primary: "#16A34A", primaryDark: "#15803D", primaryPale: "#F0FDF4", border: "#EAE5E0", borderStrong: "#D5CFC9", text: "#1F1B18", textSec: "#5C5550", textMuted: "#8E8680" };

const CATEGORIES = ["Semua", "Fashion", "Kerajinan", "Kuliner", "Kecantikan", "Jasa"];
const SORT_OPTIONS = [{ value: "relevansi", label: "Relevansi" }, { value: "harga-asc", label: "Harga Terendah" }, { value: "harga-desc", label: "Harga Tertinggi" }, { value: "rating", label: "Rating Tertinggi" }];

function fmtPrice(p: number) { return `Rp ${p.toLocaleString("id-ID")}`; }

function formatCount(n: number): string {
  if (n >= 1000) {
    const val = n / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, "")}RB`;
  }
  return String(n);
}

type StoreWithStats = Seller & { slug: string; stats: StoreStats };

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [storesLoading, setStoresLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevansi");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = query
        ? await productService.searchProducts(query, 100)
        : await productService.getProducts({ publicOnly: true, limit: 80 });
      const stats = await productService.getProductStats(data.map((p) => p.id_produk));
      setProducts(data.map((p) => productToCard(p, stats[p.id_produk])));
      setLoading(false);
    }
    load();
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setStores([]);
      return;
    }

    let cancelled = false;
    async function loadStores() {
      setStoresLoading(true);
      try {
        const found = await sellerService.searchStores(query, 3);
        if (cancelled) return;
        const withStats = await Promise.all(
          found.map(async (store) => ({
            ...store,
            stats: await sellerService.getStoreStats(store.id_seller),
          }))
        );
        if (!cancelled) setStores(withStats);
      } catch {
        if (!cancelled) setStores([]);
      } finally {
        if (!cancelled) setStoresLoading(false);
      }
    }
    loadStores();
    return () => { cancelled = true; };
  }, [query]);

  function toggleCat(cat: string) {
    if (cat === "Semua") { setSelectedCats([]); return; }
    setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }

  const filtered = products.filter((p) => {
    if (selectedCats.length > 0 && !selectedCats.includes(p.category)) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (minRating > 0 && p.rating < minRating) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "harga-asc") return a.price - b.price;
    if (sortBy === "harga-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const uniqueCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  uniqueCats.sort();
  const visibleFilterCategories = ["Semua", ...uniqueCats];

  return (
    <>
      <Navbar searchQuery={query} />
      <div className="responsive-hide-desktop">
        <SearchBar query={query} />
      </div>
      <main style={{ background: "#FCFCFA", minHeight: "70vh", paddingBottom: 72 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 0 24px", fontSize: "0.8rem", color: C.textMuted }}>
            <Link href="/" style={{ color: C.textMuted, textDecoration: "none" }}>Beranda</Link>
            <ChevronRight size={13} />
            <span style={{ color: C.text, fontWeight: 600 }}>Hasil Pencarian{query ? ` untuk "${query}"` : ""}</span>
          </nav>

          {query && (storesLoading || stores.length > 0) && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Toko berkaitan dengan &quot;{query}&quot;
                </h2>
              </div>
              {storesLoading ? (
                <div style={{ padding: 24, textAlign: "center", color: C.textMuted, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12 }}>
                  Mencari toko...
                </div>
              ) : (
                <div className="search-stores-row">
                  {stores.map((store) => (
                    <Link
                      key={store.id_seller}
                      href={`/toko/${store.slug}`}
                      className="search-store-card"
                    >
                      <div className="search-store-card-left">
                        <div className="search-store-avatar">
                          {store.logo_toko ? (
                            <Image src={store.logo_toko} alt={store.nm_store} width={64} height={64} style={{ objectFit: "cover", borderRadius: "50%" }} />
                          ) : (
                            <Store size={28} color={C.primary} />
                          )}
                        </div>
                        <div className="search-store-info">
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.text, margin: 0 }}>{store.nm_store}</h3>
                            {store.is_verified && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.65rem", fontWeight: 800, color: "#059669", background: "#ECFDF5", padding: "2px 6px", borderRadius: 4 }}>
                                <ShieldCheck size={11} /> Terverifikasi
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "0.75rem", color: C.textMuted, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                            {formatCount(store.stats.followerCount)} Pengikut
                          </p>
                        </div>
                      </div>
                      <div className="search-store-stats">
                        <div className="search-store-stat">
                          <span className="search-store-stat-label">Produk</span>
                          <span className="search-store-stat-value">{store.stats.productCount}</span>
                        </div>
                        <div className="search-store-stat">
                          <span className="search-store-stat-label">Penilaian</span>
                          <span className="search-store-stat-value">{store.stats.avgRating > 0 ? store.stats.avgRating : "-"}</span>
                        </div>
                        <div className="search-store-stat">
                          <span className="search-store-stat-label">Terjual</span>
                          <span className="search-store-stat-value">{formatCount(store.stats.totalSold)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={20} color={C.primary} />
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.text, margin: 0 }}>
                {query ? `Produk untuk "${query}"` : "Semua Produk"}
              </h1>
              <span style={{ fontSize: "0.875rem", color: C.textMuted }}>({sorted.length} produk)</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.borderStrong}`, fontSize: "0.8125rem", fontWeight: 700, color: C.text, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="catalog-layout">
            <aside className="catalog-sidebar" style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 6 }}><SlidersHorizontal size={15} />Filter</h3>
                <button onClick={() => { setSelectedCats([]); setMinPrice(""); setMaxPrice(""); setMinRating(0); }} style={{ fontSize: "0.75rem", color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Kategori</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {visibleFilterCategories.map((cat) => (
                    <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.875rem", color: C.text, fontWeight: 500 }}>
                      <input type="checkbox" checked={cat === "Semua" ? selectedCats.length === 0 : selectedCats.includes(cat)} onChange={() => toggleCat(cat)} style={{ width: 15, height: 15, accentColor: C.primary, cursor: "pointer" }} />{cat}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Rentang Harga</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{
                      flex: 1,
                      width: "100%",
                      minWidth: 0,
                      height: 36,
                      border: `1.5px solid ${C.borderStrong}`,
                      borderRadius: 6,
                      padding: "0 10px",
                      fontSize: "0.8125rem",
                      color: C.text,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                  />
                  <span style={{ color: C.textMuted, fontSize: "0.875rem" }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{
                      flex: 1,
                      width: "100%",
                      minWidth: 0,
                      height: 36,
                      border: `1.5px solid ${C.borderStrong}`,
                      borderRadius: 6,
                      padding: "0 10px",
                      fontSize: "0.8125rem",
                      color: C.text,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "0.8125rem", fontWeight: 800, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Rating Minimum</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[4.5, 4.0, 3.5, 0].map((rating) => (
                    <label key={rating} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.875rem", color: C.text }}>
                      <input type="radio" name="rating" checked={minRating === rating} onChange={() => setMinRating(rating)} style={{ accentColor: C.primary, cursor: "pointer" }} />
                      {rating === 0 ? <span style={{ fontWeight: 500 }}>Semua</span> : <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}><Star size={13} fill="#F59E0B" color="#F59E0B" />{rating}+</span>}
                    </label>
                  ))}
                </div>
              </div>
            </aside>
            <section>
              {loading ? (
                <div style={{ padding: 48, textAlign: "center", color: C.textMuted }}>Memuat produk...</div>
              ) : sorted.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, textAlign: "center", gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}><Search size={28} color={C.primary} /></div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: C.text, margin: 0 }}>Tidak Ada Hasil</h3>
                  <p style={{ fontSize: "0.875rem", color: C.textMuted, maxWidth: 300, margin: 0 }}>Coba kata kunci lain atau ubah filter pencarian kamu.</p>
                </div>
              ) : (
                <div className="search-products-grid">
                  {sorted.map((p) => (
                    <article key={p.id} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <Link href={`/produk/${p.slug}`} style={{ textDecoration: "none" }}>
                        <div style={{ position: "relative", aspectRatio: "1", background: "#F6F4F0" }}>
                          <ProductGridImage src={p.image} alt={p.name} sizes="220px" />
                        </div>
                        <div style={{ padding: 14 }}>
                          <p style={{ fontSize: "0.65rem", fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>{p.category}</p>
                          <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.text, lineHeight: 1.4, margin: "0 0 6px 0", height: "2.8em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</h3>
                          <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.primary, margin: "0 0 6px 0" }}>{p.priceRange || fmtPrice(p.price)}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: C.textMuted }}>
                            <Star size={11} fill="#F59E0B" color="#F59E0B" /><strong style={{ color: C.text }}>{p.rating}</strong><span style={{ color: C.borderStrong }}>·</span><span>{p.sold} terjual</span>
                          </div>
                        </div>
                      </Link>
                      <div style={{ padding: "0 14px 14px" }}>
                        <button onClick={async () => {
                          const user = authService.getCurrentUser();
                          if (!user) { router.push("/masuk"); return; }
                          const result = await cartService.addToCart(user.id_user, p.id, 1);
                          alert(result.ok ? `Ditambahkan: ${p.name}` : (result.error || "Gagal menambahkan ke keranjang."));
                        }} style={{ width: "100%", height: 34, border: `1.5px solid ${C.primary}`, borderRadius: 6, background: "transparent", color: C.primary, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                          <ShoppingCart size={13} />Tambah ke Keranjang
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-secondary text-sm font-semibold">Memuat hasil pencarian...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
