"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { sellerService, type Seller, type StoreStats } from "@/backend/sellerService";
import { productService } from "@/backend/productService";
import { parseProductImg, ProductGridImage, productToCard } from "@/lib/productUi";
import { cartService } from "@/backend/cartService";
import { 
  Store, 
  MapPin, 
  Star, 
  UserCheck, 
  Share2, 
  Plus, 
  Check, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  Search,
  ShoppingCart
} from "lucide-react";

interface Product {
  id: number | string;
  id_produk?: string;
  slug?: string;
  name: string;
  price: number;
  rating: number;
  sold: number;
  image: string;
  category: string;
  priceRange?: string;
}

const SHOP_PRODUCTS_FALLBACK: Product[] = [];

function formatCount(n: number): string {
  if (n >= 1000) {
    const val = n / 1000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, "")}RB`;
  }
  return String(n);
}

function formatJoined(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (months < 1) return "Baru";
  if (months < 12) return `${months} Bln Lalu`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 Thn Lalu" : `${years} Thn Lalu`;
}

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [productStats, setProductStats] = useState<Record<string, { rating: number; sold: number; reviewCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"home" | "products" | "reviews">("home");
  const [isFollowing, setIsFollowing] = useState(false);
  const [shopReviews, setShopReviews] = useState<{ id: string; user: string; rating: number; time: string; text: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadStorefrontData() {
    setLoading(true);
    try {
      const s = await sellerService.getSellerByIdOrSlug(slug);
      if (s) {
        setSeller(s);
        const user = authService.getCurrentUser();
        const [p, reviews, stats, following] = await Promise.all([
          productService.getProductsBySeller(s.id_seller),
          productService.getStoreReviews(s.id_seller),
          sellerService.getStoreStats(s.id_seller),
          user ? sellerService.isFollowingStore(user.id_user, s.id_seller) : Promise.resolve(false),
        ]);
        setProducts(p);
        setShopReviews(reviews);
        setStoreStats(stats);
        setIsFollowing(following);
        if (p.length > 0) {
          const pStats = await productService.getProductStats(p.map((item) => item.id_produk));
          setProductStats(pStats);
        } else {
          setProductStats({});
        }
      } else {
        setSeller(null);
        setProducts([]);
        setStoreStats(null);
        setShopReviews([]);
        setProductStats({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    if (slug) {
      loadStorefrontData();
    }
  }, [slug]);

  async function handleFollowToggle() {
    if (!seller) return;
    const user = authService.getCurrentUser();
    if (!user) {
      alert("Silakan masuk untuk mengikuti toko.");
      router.push("/masuk");
      return;
    }
    if (isFollowing) {
      const res = await sellerService.unfollowStore(user.id_user, seller.id_seller);
      if (res.ok) {
        setIsFollowing(false);
        setStoreStats((prev) =>
          prev ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) } : prev
        );
      } else if (res.error) {
        alert(res.error);
      }
    } else {
      const res = await sellerService.followStore(user.id_user, seller.id_seller);
      if (res.ok) {
        setIsFollowing(true);
        setStoreStats((prev) => (prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev));
      } else if (res.error) {
        alert(res.error);
      }
    }
  }

  function handleShareStore() {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => alert("Tautan toko berhasil disalin!"));
    } else {
      alert(url);
    }
  }

  async function handleAddToCart(productItem: any) {
    if (!currentUser) {
      alert("Silakan masuk terlebih dahulu untuk berbelanja.");
      router.push("/masuk");
      return;
    }
    const result = await cartService.addToCart(currentUser.id_user, productItem.id_produk, 1);
    if (result.ok) {
      alert(`Menambahkan ${productItem.nama_produk || productItem.name} ke keranjang!`);
    } else {
      alert(result.error || "Gagal menambahkan ke keranjang.");
    }
  }

  const shopName = seller?.nm_store || "Toko Daur Ulang";
  const shopLocation = seller?.addr?.trim() || "Indonesia";
  const shopLogo = seller?.logo_toko?.trim() || "";

  const activeProducts = products.length > 0 ? products.map(p => {
    const card = productToCard(p, productStats[p.id_produk]);
    return {
      ...card,
      id_produk: p.id_produk,
    };
  }) : SHOP_PRODUCTS_FALLBACK;

  const storeRating = storeStats?.avgRating ?? 0;
  const storeReviewCount = storeStats?.reviewCount ?? shopReviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = shopReviews.filter((r) => r.rating === star).length;
    const pct = shopReviews.length ? Math.round((count / shopReviews.length) * 100) : 0;
    return { star, pct };
  });

  const headerStats = [
    {
      icon: <ShoppingBag size={13} />,
      label: "Produk",
      value: `${storeStats?.productCount ?? products.length} Item${(storeStats?.productCount ?? products.length) !== 1 ? "s" : ""}`,
    },
    {
      icon: <UserCheck size={13} />,
      label: "Pengikut",
      value: formatCount(storeStats?.followerCount ?? 0),
    },
    {
      icon: <Star size={13} />,
      label: "Penilaian",
      value: storeReviewCount > 0 ? `${storeRating} / 5.0` : "Belum ada",
    },
    {
      icon: <Calendar size={13} />,
      label: "Bergabung",
      value: formatJoined(storeStats?.joinedAt || seller?.created_at || ""),
    },
    {
      icon: <TrendingUp size={13} />,
      label: "Terjual",
      value: (storeStats?.totalSold ?? 0) > 0 ? `${formatCount(storeStats!.totalSold)}+` : "0",
    },
  ];

  // Filter products by search query
  const filteredProducts = activeProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-secondary">Memuat data toko...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 px-6">
            <Store size={48} className="mx-auto mb-4 text-secondary opacity-40" />
            <h1 className="font-headline text-xl font-bold text-on-surface mb-2">Toko Tidak Ditemukan</h1>
            <p className="text-sm text-secondary mb-6 max-w-sm mx-auto">
              Toko yang Anda cari tidak tersedia atau mungkin sudah tidak aktif.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-6 space-y-6">
        
        {/* ── STORE HEADER CARD ── */}
        <section className="bg-white border border-[#EAE5E0] rounded-xl shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="h-28 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
            <button
              onClick={handleShareStore}
              title="Bagikan Toko"
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition"
            >
              <Share2 size={14} />
            </button>

            {/* Avatar di dalam banner, menempel di pojok kiri bawah */}
            <div className="absolute -bottom-8 left-6">
              {shopLogo ? (
                <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg flex-shrink-0 overflow-hidden bg-white">
                  {shopLogo.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={shopLogo} alt={shopName} width={64} height={64} className="w-full h-full object-cover" />
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 border-4 border-white flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Store size={26} />
                </div>
              )}
            </div>
          </div>

          {/* Profile content */}
          <div className="px-6 pt-12 pb-6">

            {/* Row 1: nama + badge + tombol aksi */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="font-headline text-lg font-bold text-on-surface">{shopName}</h1>
                  {seller?.is_verified !== false && (
                    <span className="bg-[#F0FDF4] text-[#16A34A] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#BFDBFE] flex items-center gap-1 select-none">
                      <ShieldCheck size={9} />
                      Verified Merchant
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-secondary font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="opacity-60" />
                    {shopLocation}
                  </span>
                  {seller && (
                    <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Toko Aktif
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleFollowToggle}
                  disabled={!seller || loading}
                  className={`h-8 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isFollowing
                      ? "bg-[#F0F0F0] text-[#5C5550] border border-[#D5CFC9] hover:bg-[#E8E8E8]"
                      : "bg-primary text-white hover:brightness-95 active:scale-95"
                  }`}
                >
                  {isFollowing ? <><Check size={12} />Mengikuti</> : <><Plus size={12} />Ikuti Toko</>}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#EAE5E0] my-5" />

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {headerStats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center gap-1.5 py-3 px-2 rounded-xl bg-[#F8FAFF] border border-[#E8F0FE]">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#BFDBFE] flex items-center justify-center text-primary shadow-sm">
                    {stat.icon}
                  </div>
                  <p className="text-sm font-extrabold text-on-surface leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-secondary font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TABS NAVIGATION ── */}
        <section className="bg-white border border-[#EAE5E0] rounded-lg p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-3 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "home"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            Halaman Utama
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-3 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "products"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            Semua Produk
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 rounded text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "reviews"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            Ulasan Toko
          </button>
        </section>

        {/* ── CONTENT BODY SWITCHING ── */}
        <div className="space-y-8">
          
          {/* TAB 1: HOME PAGE */}
          {activeTab === "home" && (
            <>
              {/* Showcase Category 1: Recommended Products */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold text-on-surface">Sesuai incaran Anda di toko ini</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {activeProducts.slice(0, 4).map((product) => (
                    <article key={product.id} className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden flex flex-col shadow-xs group hover:shadow-md transition duration-200">
                      <Link href={`/produk/${product.slug}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <ProductGridImage src={product.image} alt={product.name} />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.slug}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">{product.priceRange || `Rp ${product.price.toLocaleString("id-ID")}`}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition"
                            title="Tambah ke Keranjang"
                          >
                            <ShoppingCart size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Showcase Category 2: Bestsellers */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold text-on-surface">Produk Terlaris</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {activeProducts.slice(2, 6).map((product) => (
                    <article key={product.id} className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden flex flex-col shadow-xs group hover:shadow-md transition duration-200">
                      <Link href={`/produk/${product.slug}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <ProductGridImage src={product.image} alt={product.name} />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.slug}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">{product.priceRange || `Rp ${product.price.toLocaleString("id-ID")}`}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition"
                            title="Tambah ke Keranjang"
                          >
                            <ShoppingCart size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ALL PRODUCTS LIST */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Product list header with search filtering */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#EAE5E0] p-4 rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Semua Produk</h3>
                  <p className="text-xs text-secondary mt-0.5">Menampilkan {filteredProducts.length} produk pilihan</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari produk di toko ini..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#EAE5E0] rounded-lg bg-surface-container-low text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-on-surface font-semibold"
                  />
                </div>
              </div>

              {/* Grid Layout */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden flex flex-col shadow-xs group hover:shadow-md transition duration-200">
                      <Link href={`/produk/${product.slug}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <ProductGridImage src={product.image} alt={product.name} />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.slug}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">{product.priceRange || `Rp ${product.price.toLocaleString("id-ID")}`}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:brightness-95 active:scale-95 transition"
                            title="Tambah ke Keranjang"
                          >
                            <ShoppingCart size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#EAE5E0] rounded-xl p-12 text-center text-secondary text-sm font-semibold shadow-sm">
                  Tidak ada produk ditemukan dengan kata kunci tersebut.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STORE REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Review summary cards */}
              <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl shadow-sm flex flex-col sm:flex-row gap-6 justify-around items-center">
                <div className="text-center space-y-1">
                  <h4 className="text-4xl font-extrabold text-primary">
                    {storeReviewCount > 0 ? storeRating.toFixed(1) : "-"}
                  </h4>
                  <div className="flex gap-0.5 text-amber-500 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={storeReviewCount > 0 && i <= Math.round(storeRating) ? "#F59E0B" : "none"}
                        color="#F59E0B"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-secondary font-semibold">
                    {storeReviewCount} Ulasan{storeReviewCount !== 1 ? "" : ""}
                  </p>
                </div>
                <div className="w-[1px] h-16 bg-[#EAE5E0] hidden sm:block" />
                <div className="space-y-2 w-full sm:w-auto text-xs font-semibold text-secondary">
                  {ratingBreakdown.slice(0, 3).map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-8">{star} Bintang</span>
                      <div className="flex-1 sm:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="bg-white border border-[#EAE5E0] rounded-xl shadow-sm divide-y divide-[#EAE5E0]/40">
                {shopReviews.length === 0 ? (
                  <p className="p-6 text-sm text-secondary">Belum ada ulasan untuk toko ini.</p>
                ) : shopReviews.map((rev) => (
                  <div key={rev.id} className="p-6 flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-surface-container text-secondary flex items-center justify-center font-bold text-sm border border-surface-container-high flex-shrink-0">
                      {rev.user.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-on-surface">{rev.user}</h4>
                        <span className="text-[10px] text-secondary font-medium">{rev.time}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-secondary leading-relaxed italic">
                        &quot;{rev.text}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
