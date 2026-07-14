"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag, Zap, Clock, Star, ShoppingCart, ChevronRight, Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { productService } from "@/backend/productService";
import { productToCard, promoDiscountPercent, ProductGridImage } from "@/lib/productUi";
import { cartService } from "@/backend/cartService";
import { authService } from "@/backend/authService";

const C = { primary: "#16A34A", primaryDark: "#15803D", primaryPale: "#F0FDF4", border: "#EAE5E0", borderStrong: "#D5CFC9", text: "#1F1B18", textSec: "#5C5550", textMuted: "#8E8680" };

type PromoItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  rating: number;
  sold: number;
  category: string;
  stock: number;
};

const CAT_FILTERS = ["Semua", "Fashion", "Kerajinan", "Kuliner", "Kecantikan"];
function fmtPrice(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }

const TARGET = new Date();
TARGET.setDate(TARGET.getDate() + 1);
TARGET.setHours(23, 59, 59, 0);

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

export default function PromoPage() {
  const [time, setTime] = useState(getTimeLeft());
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [promoToday, setPromoToday] = useState<PromoItem[]>([]);
  const [promoUpcoming, setPromoUpcoming] = useState<PromoItem[]>([]);

  useEffect(() => { const t = setInterval(() => setTime(getTimeLeft()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    async function load() {
      const data = await productService.getProducts({ publicOnly: true, limit: 20 });
      const stats = await productService.getProductStats(data.map((p) => p.id_produk));
      const items: PromoItem[] = data.map((p) => {
        const card = productToCard(p, stats[p.id_produk]);
        const discount = promoDiscountPercent(p.id_produk);
        const discountPrice = Math.round(p.harga * (1 - discount / 100));
        return {
          id: card.id,
          slug: card.slug,
          name: card.name,
          image: card.image,
          originalPrice: p.harga,
          discountPrice,
          discount,
          rating: card.rating || 4.5,
          sold: card.sold,
          category: card.category,
          stock: p.stok,
        };
      });
      setPromoToday(items.slice(0, 10));
      setPromoUpcoming(items.slice(10, 15));
    }
    load();
  }, []);

  const filteredToday = activeFilter === "Semua" ? promoToday : promoToday.filter((p) => p.category === activeFilter);

  return (
    <div style={{ background: "#FCFCFA", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div className="responsive-hide-desktop">
        <SearchBar />
      </div>
      <main style={{ flex: 1, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 0 20px", fontSize: "0.8rem", color: C.textMuted }}>
            <Link href="/" style={{ color: C.textMuted, textDecoration: "none" }}>Beranda</Link>
            <ChevronRight size={13} />
            <span style={{ color: C.text, fontWeight: 600 }}>Promo & Flash Sale</span>
          </nav>

          {/* Hero */}
          <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #7C3AED 100%)`, borderRadius: 16, padding: "44px 48px", marginBottom: 40, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -60, top: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Flame size={20} color="#FDE68A" />
                <span style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.9 }}>Flash Sale Aktif</span>
              </div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: "0 0 8px 0", lineHeight: 1.15 }}>Promo Spesial Daur Ulang</h1>
              <p style={{ fontSize: "1rem", opacity: 0.85, margin: "0 0 28px 0", maxWidth: 480, lineHeight: 1.6 }}>Diskon hingga 30% untuk produk kerajinan, kuliner, fashion, dan kecantikan pilihan langsung dari pengrajin lokal Indonesia.</p>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.8, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> Berakhir dalam:</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ label: "Hari", val: time.d }, { label: "Jam", val: time.h }, { label: "Menit", val: time.m }, { label: "Detik", val: time.s }].map((unit) => (
                    <div key={unit.label} style={{ textAlign: "center" }}>
                      <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.625rem", fontWeight: 900 }}>{pad(unit.val)}</div>
                      <p style={{ fontSize: "0.65rem", marginTop: 5, opacity: 0.75, fontWeight: 700, textTransform: "uppercase" }}>{unit.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
            {CAT_FILTERS.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)} style={{ padding: "8px 18px", borderRadius: 20, border: `1.5px solid ${activeFilter === cat ? C.primary : C.borderStrong}`, background: activeFilter === cat ? C.primaryPale : "white", color: activeFilter === cat ? C.primary : C.textSec, fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>{cat}</button>
            ))}
          </div>

          {/* Promo Hari Ini */}
          <section style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Zap size={20} color="#F59E0B" fill="#F59E0B" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.text, margin: 0 }}>Promo Hari Ini</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {filteredToday.map((p) => (
                <article key={p.id} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <Link href={`/produk/${p.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ position: "relative", aspectRatio: "1", background: "#F6F4F0" }}>
                      <ProductGridImage src={p.image} alt={p.name} sizes="200px" />
                      <div style={{ position: "absolute", top: 8, left: 8, background: "#EF4444", color: "white", fontSize: "0.7rem", fontWeight: 900, padding: "3px 8px", borderRadius: 6 }}>-{p.discount}%</div>
                      {p.stock <= 10 && <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.65)", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>Stok: {p.stock}</div>}
                    </div>
                    <div style={{ padding: 12 }}>
                      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: C.text, lineHeight: 1.4, margin: "0 0 6px 0", height: "2.5em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: "0.9375rem", fontWeight: 900, color: "#EF4444" }}>{fmtPrice(p.discountPrice)}</span>
                        <span style={{ fontSize: "0.75rem", color: C.textMuted, textDecoration: "line-through" }}>{fmtPrice(p.originalPrice)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: C.textMuted }}>
                        <Star size={11} fill="#F59E0B" color="#F59E0B" /><strong style={{ color: C.text }}>{p.rating}</strong><span>·</span><span>{p.sold} terjual</span>
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: "0 12px 12px" }}>
                    <button onClick={async () => {
                      const user = authService.getCurrentUser();
                      if (!user) { window.location.href = "/masuk"; return; }
                      const result = await cartService.addToCart(user.id_user, p.id, 1);
                      alert(result.ok ? `Ditambahkan: ${p.name}` : (result.error || "Gagal menambahkan."));
                    }} style={{ width: "100%", height: 32, border: "none", background: C.primary, color: "white", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 6, fontFamily: "inherit" }}>
                      <ShoppingCart size={13} />Beli Sekarang
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Akan Datang */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Tag size={18} color={C.primary} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.text, margin: 0 }}>Akan Datang</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {promoUpcoming.map((p) => (
                <article key={p.id} style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", opacity: 0.85 }}>
                  <Link href={`/produk/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ position: "relative", aspectRatio: "1", background: "#F6F4F0" }}>
                      <ProductGridImage src={p.image} alt={p.name} sizes="200px" style={{ filter: "grayscale(30%)" }} />
                      <div style={{ position: "absolute", top: 8, left: 8, background: C.primary, color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>-{p.discount}% SEGERA</div>
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ background: "rgba(0,0,0,0.55)", color: "white", padding: "6px 14px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} />Segera
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 12 }}>
                      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: C.text, lineHeight: 1.4, margin: "0 0 6px 0", height: "2.5em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: C.primary }}>{fmtPrice(p.discountPrice)}</span>
                        <span style={{ fontSize: "0.75rem", color: C.textMuted, textDecoration: "line-through" }}>{fmtPrice(p.originalPrice)}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
