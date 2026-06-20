"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Store, 
  MapPin, 
  Star, 
  UserCheck, 
  MessageSquare, 
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
  id: number;
  name: string;
  price: number;
  rating: number;
  sold: number;
  image: string;
  category: string;
}

const SHOP_PRODUCTS: Product[] = [
  { id: 1, name: "Mangkuk Keramik Motif Megamendung Handmade", category: "KERAJINAN", price: 125000, rating: 4.9, sold: 120, image: "/product-keramik.png" },
  { id: 2, name: "Gelas Keramik Motif Batik Indigo", category: "KERAJINAN", price: 75000, rating: 4.8, sold: 160, image: "/similar-1.png" },
  { id: 3, name: "Piring Dekoratif Batik Parang", category: "KERAJINAN", price: 95000, rating: 5.0, sold: 45, image: "/similar-2.png" },
  { id: 4, name: "Set Wadah Sambel Keramik", category: "KERAJINAN", price: 120000, rating: 4.7, sold: 80, image: "/similar-3.png" },
  { id: 5, name: "Vas Bunga Keramik Kontemporer", category: "KERAJINAN", price: 210000, rating: 4.9, sold: 30, image: "/similar-4.png" },
  { id: 6, name: "Teko Keramik Handmade Tradisional", category: "KERAJINAN", price: 320000, rating: 4.6, sold: 15, image: "/similar-5.png" }
];

const SHOP_REVIEWS = [
  { id: 1, user: "Budi Nugraha", rating: 5, time: "2 hari yang lalu", text: "Barangnya sangat bagus, packing aman sekali tebal bubble wrap-nya. Motif batiknya sangat rapi." },
  { id: 2, user: "Siti Rahmawati", rating: 5, time: "5 hari yang lalu", text: "Mangkuknya cantik sekali, pas buat hiasan maupun dipakai makan sehari-hari. Sukses terus UMKM Jogja!" },
  { id: 3, user: "Hendra Wijaya", rating: 4, time: "1 minggu yang lalu", text: "Kualitas keramiknya bagus, tebal dan kokoh. Pengiriman agak lambat sedikit dari kurir tapi seller ramah banget." }
];

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [activeTab, setActiveTab] = useState<"home" | "products" | "reviews">("home");
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const shopName = slug === "griya-keramik" ? "Griya Keramik Kasongan" : "Toko Kreatif UMKM";
  const shopLocation = slug === "griya-keramik" ? "Bantul, Yogyakarta" : "Sleman, Yogyakarta";

  // Filter products by search query
  const filteredProducts = SHOP_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={() => alert("Tautan toko berhasil disalin ke clipboard!")}
              title="Bagikan Toko"
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition"
            >
              <Share2 size={14} />
            </button>

            {/* Avatar di dalam banner, menempel di pojok kiri bawah */}
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 border-4 border-white flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Store size={26} />
              </div>
            </div>
          </div>

          {/* Profile content */}
          <div className="px-6 pt-12 pb-6">

            {/* Row 1: nama + badge + tombol aksi */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="font-headline text-lg font-bold text-on-surface">{shopName}</h1>
                  <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#BFDBFE] flex items-center gap-1 select-none">
                    <ShieldCheck size={9} />
                    Verified Merchant
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-secondary font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="opacity-60" />
                    {shopLocation}
                  </span>
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online · Aktif 5 menit lalu
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`h-8 px-4 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isFollowing
                      ? "bg-[#F0F0F0] text-[#5C5550] border border-[#D5CFC9] hover:bg-[#E8E8E8]"
                      : "bg-primary text-white hover:brightness-95 active:scale-95"
                  }`}
                >
                  {isFollowing ? <><Check size={12} />Mengikuti</> : <><Plus size={12} />Ikuti Toko</>}
                </button>
                <Link
                  href="/chat"
                  className="h-8 px-4 rounded-lg border border-[#1D4ED8] text-[#1D4ED8] bg-white text-xs font-bold hover:bg-[#EFF6FF] transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageSquare size={12} />
                  Chat Penjual
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#EAE5E0] my-5" />

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { icon: <ShoppingBag size={13} />, label: "Produk", value: "45 Items" },
                { icon: <UserCheck size={13} />, label: "Pengikut", value: "1.2RB" },
                { icon: <Star size={13} />, label: "Penilaian", value: "4.9 / 5.0" },
                { icon: <MessageSquare size={13} />, label: "Resp. Chat", value: "98% Cepat" },
                { icon: <Calendar size={13} />, label: "Bergabung", value: "1 Thn Lalu" },
                { icon: <TrendingUp size={13} />, label: "Terjual", value: "1.8RB+" },
              ].map((stat) => (
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
              {/* Voucher Section (Shopee/Tokopedia Style) */}
              <div className="bg-white border border-[#EAE5E0] rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primary" />
                  Voucher Spesial Toko
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Voucher 1 */}
                  <div className="border border-dashed border-[#1D4ED8]/30 bg-primary-pale rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold bg-[#1D4ED8] text-white px-1.5 py-0.5 rounded">Diskon Toko</span>
                      <h4 className="font-extrabold text-sm text-on-surface mt-1">Potongan Rp 15.000</h4>
                      <p className="text-[10px] text-secondary font-medium">Minimal belanja Rp 150.000</p>
                    </div>
                    <button
                      onClick={() => alert("Voucher Potongan Belanja berhasil diklaim!")}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded hover:brightness-95 transition"
                    >
                      Klaim
                    </button>
                  </div>
                  {/* Voucher 2 */}
                  <div className="border border-dashed border-[#1D4ED8]/30 bg-primary-pale rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold bg-[#1D4ED8] text-white px-1.5 py-0.5 rounded">Free Ongkir</span>
                      <h4 className="font-extrabold text-sm text-on-surface mt-1">Gratis Ongkir s/d Rp 20.000</h4>
                      <p className="text-[10px] text-secondary font-medium">Minimal belanja Rp 100.000</p>
                    </div>
                    <button
                      onClick={() => alert("Voucher Gratis Ongkir berhasil diklaim!")}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded hover:brightness-95 transition"
                    >
                      Klaim
                    </button>
                  </div>
                </div>
              </div>

              {/* Showcase Category 1: Recommended Products */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold text-on-surface">Sesuai incaran Anda di toko ini</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {SHOP_PRODUCTS.slice(0, 4).map((product) => (
                    <article key={product.id} className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden flex flex-col shadow-xs group hover:shadow-md transition duration-200">
                      <Link href={`/produk/${product.id}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.id}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">Rp {product.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => alert(`Menambahkan ${product.name} ke keranjang!`)}
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
                  {SHOP_PRODUCTS.slice(2, 6).map((product) => (
                    <article key={product.id} className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden flex flex-col shadow-xs group hover:shadow-md transition duration-200">
                      <Link href={`/produk/${product.id}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.id}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">Rp {product.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => alert(`Menambahkan ${product.name} ke keranjang!`)}
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
                      <Link href={`/produk/${product.id}`} className="block relative aspect-square bg-[#F8F6F4]">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-extrabold text-primary">{product.category}</p>
                          <h4 className="font-bold text-xs text-on-surface leading-snug line-clamp-2 h-8 hover:text-primary transition">
                            <Link href={`/produk/${product.id}`}>{product.name}</Link>
                          </h4>
                          <p className="text-sm font-black text-primary">Rp {product.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5E0]/60">
                          <div className="flex items-center gap-0.5 text-[10px] text-secondary font-medium">
                            <span className="text-amber-500">★</span>
                            <span>{product.rating}</span>
                            <span className="text-[#D5CFC9]">·</span>
                            <span>{product.sold} terjual</span>
                          </div>
                          <button
                            onClick={() => alert(`Menambahkan ${product.name} ke keranjang!`)}
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
                  <h4 className="text-4xl font-extrabold text-primary">4.9</h4>
                  <div className="flex gap-0.5 text-amber-500 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <p className="text-xs text-secondary font-semibold">240 Ulasan Terverifikasi</p>
                </div>
                <div className="w-[1px] h-16 bg-[#EAE5E0] hidden sm:block" />
                <div className="space-y-2 w-full sm:w-auto text-xs font-semibold text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="w-8">5 Bintang</span>
                    <div className="flex-1 sm:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[95%]" />
                    </div>
                    <span className="w-8 text-right">95%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8">4 Bintang</span>
                    <div className="flex-1 sm:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[4%]" />
                    </div>
                    <span className="w-8 text-right">4%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8">3 Bintang</span>
                    <div className="flex-1 sm:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="bg-[#EAE5E0] h-full w-[1%]" />
                    </div>
                    <span className="w-8 text-right">1%</span>
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div className="bg-white border border-[#EAE5E0] rounded-xl shadow-sm divide-y divide-[#EAE5E0]/40">
                {SHOP_REVIEWS.map((rev) => (
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
