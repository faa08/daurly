"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, ShoppingBag, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";

/* ─────────────────────────────────────────
   Types & initial data
───────────────────────────────────────── */
interface CartItem {
  id: number;
  name: string;
  seller: string;
  price: number;
  originalPrice?: number;
  qty: number;
  image: string;
  color: string;
  size: string;
  checked: boolean;
}

const INITIAL_CART: CartItem[] = [
  {
    id: 1,
    name: "Mangkuk Keramik Motif Batik",
    seller: "Griya Keramik Kasongan",
    price: 125000,
    originalPrice: 150000,
    qty: 2,
    image: "/product-detail-keramik.png",
    color: "Biru Batik",
    size: "15 cm",
    checked: true,
  },
  {
    id: 2,
    name: "Kopi Arabika Gayo Premium",
    seller: "Kopi Nusantara Store",
    price: 85000,
    qty: 1,
    image: "/product-kopi.png",
    color: "—",
    size: "250 gram",
    checked: true,
  },
  {
    id: 3,
    name: "Dompet Kulit Batik Eksklusif",
    seller: "Batik Craft Jogja",
    price: 195000,
    qty: 1,
    image: "/product-dompet.png",
    color: "Cokelat Tanah",
    size: "Medium",
    checked: false,
  },
];

const RECOMMENDED = [
  { id: 1, name: "Gelas Keramik Motif Batik Indigo", price: 75000, rating: 4.8, sold: 120, image: "/similar-1.png" },
  { id: 2, name: "Piring Dekoratif Batik Parang", price: 95000, rating: 5.0, sold: 45, image: "/similar-2.png" },
  { id: 3, name: "Set Wadah Sambel Keramik", price: 120000, rating: 4.7, sold: 80, image: "/similar-3.png" },
  { id: 4, name: "Vas Bunga Keramik Kontemporer", price: 210000, rating: 4.9, sold: 30, image: "/similar-4.png" },
];

function fmtPrice(p: number) {
  return `Rp ${p.toLocaleString("id-ID")}`;
}

/* ─────────────────────────────────────────
   Styles (shared tokens)
───────────────────────────────────────── */
const C = {
  primary: "#E8600A",
  primaryDark: "#C24E08",
  primaryPale: "#FFF3ED",
  surface: "#FCFCFA",
  card: "#FFFFFF",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  /* ── helpers ── */
  const checkedItems = items.filter((i) => i.checked);
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherApplied ? Math.floor(subtotal * 0.1) : 0;
  const shipping = checkedItems.length > 0 ? 15000 : 0;
  const total = subtotal - discount + shipping;

  function updateQty(id: number, delta: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function toggleItem(id: number) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  }

  function toggleAll() {
    const next = !allChecked;
    setAllChecked(next);
    setItems((prev) => prev.map((it) => ({ ...it, checked: next })));
  }

  function applyVoucher() {
    if (voucher.trim().toUpperCase() === "LOKALBANGGA") {
      setVoucherApplied(true);
    } else {
      alert("Kode voucher tidak valid.");
    }
  }

  /* ── render ── */
  return (
    <>
      <Navbar />
      <SearchBar />

      <main style={{ background: C.surface, minHeight: "70vh", paddingBottom: 72 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 0 24px", fontSize: "0.8rem", color: C.textMuted }}>
            <Link href="/" style={{ color: C.textMuted, textDecoration: "none" }}>Beranda</Link>
            <ChevronRight size={13} />
            <span style={{ color: C.text, fontWeight: 600 }}>Keranjang Belanja</span>
          </nav>

          {/* Page Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <ShoppingBag size={22} color={C.primary} />
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.text, margin: 0 }}>
              Keranjang Belanja
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.textMuted, marginLeft: 10 }}>
                ({items.length} produk)
              </span>
            </h1>
          </div>

          {items.length === 0 ? (
            /* ── Empty State ── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
              <ShoppingBag size={64} color={C.borderStrong} strokeWidth={1.2} />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: C.textMuted, margin: 0 }}>Keranjang kamu masih kosong</h2>
              <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>Yuk, temukan produk UMKM pilihan dan mulai belanja!</p>
              <Link href="/" style={{ marginTop: 8, background: C.primary, color: "white", borderRadius: 8, padding: "10px 28px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* ── Main Grid ── */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

              {/* ── LEFT: Cart Items ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Select-All row */}
                <div style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    id="check-all"
                    style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer" }}
                  />
                  <label htmlFor="check-all" style={{ fontSize: "0.875rem", fontWeight: 700, color: C.text, cursor: "pointer" }}>
                    Pilih Semua ({items.length} Produk)
                  </label>
                  {checkedItems.length > 0 && (
                    <button
                      onClick={() => { const ids = checkedItems.map(i => i.id); setItems(prev => prev.filter(it => !ids.includes(it.id))); }}
                      style={{ marginLeft: "auto", fontSize: "0.8rem", fontWeight: 600, color: "#EF4444", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Trash2 size={14} />
                      Hapus Dipilih
                    </button>
                  )}
                </div>

                {/* Items */}
                {items.map((item) => (
                  <div key={item.id} style={{
                    background: C.card,
                    border: `1px solid ${item.checked ? C.primary : C.border}`,
                    borderRadius: 12,
                    padding: 20,
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    transition: "border-color 0.2s",
                  }}>
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer", marginTop: 4, flexShrink: 0 }}
                    />

                    {/* Product Image */}
                    <div style={{ position: "relative", width: 96, height: 96, borderRadius: 8, overflow: "hidden", background: "#F8F6F4", border: `1px solid ${C.border}`, flexShrink: 0 }}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.textMuted, letterSpacing: "0.04em", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                            {item.seller}
                          </p>
                          <Link href={`/produk/${item.id}`} style={{ fontSize: "0.9375rem", fontWeight: 700, color: C.text, textDecoration: "none", display: "block", lineHeight: 1.35 }}>
                            {item.name}
                          </Link>
                        </div>
                        <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4, flexShrink: 0 }}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Variant */}
                      <div style={{ display: "flex", gap: 8 }}>
                        {item.color !== "—" && (
                          <span style={{ fontSize: "0.75rem", color: C.textSec, background: "#F4F1EE", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                            {item.color}
                          </span>
                        )}
                        <span style={{ fontSize: "0.75rem", color: C.textSec, background: "#F4F1EE", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                          {item.size}
                        </span>
                      </div>

                      {/* Price + Qty Row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <div>
                          <span style={{ fontSize: "1.0625rem", fontWeight: 800, color: C.primary }}>
                            {fmtPrice(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span style={{ fontSize: "0.8rem", color: C.textMuted, textDecoration: "line-through", marginLeft: 8 }}>
                              {fmtPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Qty Controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden" }}>
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            disabled={item.qty <= 1}
                            style={{
                              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                              background: "none", border: "none", cursor: item.qty <= 1 ? "not-allowed" : "pointer",
                              color: item.qty <= 1 ? C.textMuted : C.text, transition: "background 0.15s",
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ width: 36, textAlign: "center", fontSize: "0.875rem", fontWeight: 700, color: C.text }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            style={{
                              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                              background: "none", border: "none", cursor: "pointer", color: C.text, transition: "background 0.15s",
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Item Subtotal */}
                      <p style={{ fontSize: "0.75rem", color: C.textMuted, margin: 0, textAlign: "right" }}>
                        Subtotal: <strong style={{ color: C.text }}>{fmtPrice(item.price * item.qty)}</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Voucher Input */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Tag size={16} color={C.primary} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: C.text }}>Kode Voucher</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Masukkan kode voucher (LOKALBANGGA)"
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                      disabled={voucherApplied}
                      style={{
                        flex: 1, height: 40, border: `1.5px solid ${voucherApplied ? "#22C55E" : C.borderStrong}`,
                        borderRadius: 8, padding: "0 14px", fontSize: "0.8125rem",
                        color: C.text, fontFamily: "inherit", outline: "none",
                        background: voucherApplied ? "#F0FDF4" : "white",
                      }}
                    />
                    <button
                      onClick={applyVoucher}
                      disabled={voucherApplied}
                      style={{
                        height: 40, padding: "0 20px", borderRadius: 8,
                        background: voucherApplied ? "#22C55E" : C.primary,
                        color: "white", fontWeight: 700, fontSize: "0.8125rem",
                        border: "none", cursor: voucherApplied ? "default" : "pointer", fontFamily: "inherit",
                      }}
                    >
                      {voucherApplied ? "✓ Terpakai" : "Terapkan"}
                    </button>
                  </div>
                  {voucherApplied && (
                    <p style={{ fontSize: "0.75rem", color: "#16A34A", fontWeight: 600, marginTop: 8, marginBottom: 0 }}>
                      🎉 Voucher LOKALBANGGA berhasil diterapkan! Hemat 10%.
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { icon: <ShieldCheck size={18} color={C.primary} />, title: "Pembayaran Aman", desc: "Data transaksi terenkripsi SSL" },
                    { icon: <Truck size={18} color={C.primary} />, title: "Pengiriman Terjamin", desc: "Estimasi 2–5 hari kerja" },
                  ].map((b, i) => (
                    <div key={i} style={{ background: C.primaryPale, border: `1px solid #FDDAC4`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      {b.icon}
                      <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: C.text, margin: 0 }}>{b.title}</p>
                        <p style={{ fontSize: "0.7rem", color: C.textSec, margin: 0 }}>{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 80 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: C.text, margin: "0 0 20px 0" }}>Ringkasan Pesanan</h2>

                  {/* Summary Lines */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                      <span style={{ color: C.textSec }}>Subtotal ({checkedItems.reduce((s, i) => s + i.qty, 0)} item)</span>
                      <span style={{ fontWeight: 600, color: C.text }}>{fmtPrice(subtotal)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                      <span style={{ color: C.textSec }}>Ongkos Kirim</span>
                      <span style={{ fontWeight: 600, color: checkedItems.length === 0 ? C.textMuted : C.text }}>
                        {checkedItems.length === 0 ? "—" : fmtPrice(shipping)}
                      </span>
                    </div>

                    {voucherApplied && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                        <span style={{ color: "#16A34A", fontWeight: 600 }}>Diskon Voucher</span>
                        <span style={{ fontWeight: 700, color: "#16A34A" }}>− {fmtPrice(discount)}</span>
                      </div>
                    )}

                    <div style={{ height: 1, background: C.border }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: C.text }}>Total Pembayaran</span>
                      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: C.primary }}>{fmtPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    disabled={checkedItems.length === 0}
                    style={{
                      width: "100%", height: 50, marginTop: 20,
                      background: checkedItems.length === 0 ? C.borderStrong : C.primary,
                      color: "white", borderRadius: 10, border: "none",
                      fontSize: "0.9375rem", fontWeight: 800, cursor: checkedItems.length === 0 ? "not-allowed" : "pointer",
                      fontFamily: "inherit", transition: "background 0.2s",
                    }}
                  >
                    {checkedItems.length === 0 ? "Pilih Produk Terlebih Dahulu" : `Beli Sekarang (${checkedItems.reduce((s, i) => s + i.qty, 0)} item)`}
                  </button>

                  <p style={{ fontSize: "0.75rem", color: C.textMuted, textAlign: "center", marginTop: 12, marginBottom: 0 }}>
                    Dengan melanjutkan, kamu menyetujui{" "}
                    <Link href="#" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>Syarat &amp; Ketentuan</Link>
                  </p>
                </div>

                {/* Promo Banner */}
                <div style={{
                  background: "linear-gradient(135deg, #E8600A, #C24E08)",
                  borderRadius: 12, padding: "18px 20px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag size={16} color="white" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "white" }}>Promo Eksklusif</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>
                    Hemat 10% dengan kode <strong style={{ color: "white" }}>LOKALBANGGA</strong> untuk produk kerajinan tangan pilihan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Recommended Products ── */}
          <section style={{ marginTop: 56 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: C.text, margin: "0 0 4px 0" }}>Produk Rekomendasi</h2>
                <p style={{ fontSize: "0.8125rem", color: C.textMuted, margin: 0 }}>Produk UMKM pilihan yang mungkin kamu suka</p>
              </div>
              <Link href="/" style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.primary, textDecoration: "none" }}>
                Lihat Semua →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {RECOMMENDED.map((p) => (
                <Link key={p.id} href={`/produk/rekomendasi-${p.id}`} style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                  overflow: "hidden", textDecoration: "none", display: "flex",
                  flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                  <div style={{ position: "relative", aspectRatio: "1", background: "#F8F6F4" }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 14 }}>
                    <h3 style={{
                      fontSize: "0.8125rem", fontWeight: 700, color: C.text,
                      lineHeight: 1.4, margin: "0 0 6px 0",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.5em",
                    }}>{p.name}</h3>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: C.primary, margin: "0 0 8px 0" }}>
                      {fmtPrice(p.price)}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: C.textMuted }}>
                      <span style={{ color: "#F59E0B" }}>★</span>
                      <span style={{ fontWeight: 700, color: C.text }}>{p.rating}</span>
                      <span style={{ color: C.borderStrong }}>·</span>
                      <span>{p.sold} terjual</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
