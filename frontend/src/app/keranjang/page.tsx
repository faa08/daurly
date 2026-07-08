"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, ShieldCheck, Truck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { cartService } from "@/backend/cartService";
import { orderService } from "@/backend/orderService";
import { apiFetch } from "@/lib/api-client";
interface UICartItem {
  id_cart_item: string;
  id_produk: string;
  slug?: string;
  name: string;
  seller: string;
  price: number;
  qty: number;
  image: string;
  checked: boolean;
}

import { productService } from "@/backend/productService";
import { productToCard, type ProductCard } from "@/lib/productUi";

function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img);
      return arr[0] || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

function fmtPrice(p: number) {
  return `Rp ${p.toLocaleString("id-ID")}`;
}

/* ─────────────────────────────────────────
   Styles (shared tokens)
 ───────────────────────────────────────── */
const C = {
  primary: "#16A34A",
  primaryDark: "#15803D",
  primaryPale: "#F0FDF4",
  surface: "#FCFCFA",
  card: "#FFFFFF",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<UICartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDetails, setVoucherDetails] = useState<any | null>(null);
  const [recommended, setRecommended] = useState<ProductCard[]>([]);
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    productService.getProducts({ publicOnly: true, limit: 4 }).then(async (data) => {
      const stats = await productService.getProductStats(data.map((p) => p.id_produk));
      setRecommended(data.map((p) => productToCard(p, stats[p.id_produk])));
    });
  }, []);

  const loadCart = useCallback(async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/masuk?redirect=/keranjang");
      return;
    }
    setLoading(true);
    const dbItems = await cartService.getCartItems(user.id_user);
    const mapped: UICartItem[] = dbItems
      .filter((i) => i.produk)
      .map((i) => ({
        id_cart_item: i.id_cart_item,
        id_produk: i.id_produk,
        slug: i.produk!.slug,
        name: i.produk!.nama_produk,
        seller: i.produk!.nm_store || "Mitra Perajin",
        price: i.produk!.harga,
        qty: i.qty_cartitem,
        image: parseProductImg(i.produk!.img),
        checked: true,
      }));
    setItems(mapped);
    setAllChecked(mapped.length > 0);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ── helpers ── */
  const checkedItems = items.filter((i) => i.checked);
  const subtotal = checkedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherDetails
    ? voucherDetails.discount_type === "percentage"
      ? Math.min(
          Number(voucherDetails.max_discount) > 0 ? Number(voucherDetails.max_discount) : Infinity,
          Math.floor(subtotal * (Number(voucherDetails.value) / 100))
        )
      : Number(voucherDetails.value)
    : 0;
  const shipping = checkedItems.length > 0 ? 15000 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function updateQty(id: string, delta: number) {
    const item = items.find((it) => it.id_cart_item === id);
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    setItems((prev) =>
      prev.map((it) => (it.id_cart_item === id ? { ...it, qty: newQty } : it))
    );
    await cartService.updateCartQuantity(id, newQty);
  }

  async function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id_cart_item !== id));
    await cartService.removeFromCart(id);
  }

  async function removeChecked() {
    const ids = checkedItems.map((i) => i.id_cart_item);
    setItems((prev) => prev.filter((it) => !ids.includes(it.id_cart_item)));
    await Promise.all(ids.map((id) => cartService.removeFromCart(id)));
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id_cart_item === id ? { ...it, checked: !it.checked } : it))
    );
  }

  function toggleAll() {
    const next = !allChecked;
    setAllChecked(next);
    setItems((prev) => prev.map((it) => ({ ...it, checked: next })));
  }

  async function applyVoucher() {
    const code = voucher.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await apiFetch("/api/voucher/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menerapkan voucher.");
        return;
      }

      setVoucherApplied(true);
      setVoucherDetails(data.voucher);
      alert(`Voucher ${data.voucher.code} berhasil diterapkan!`);
    } catch (err) {
      console.error(err);
      alert("Gagal memvalidasi voucher.");
    }
  }

  function handleCheckout() {
    if (checkedItems.length === 0) return;
    orderService.saveCheckoutSession(checkedItems.map((i) => i.id_cart_item));
    if (voucherApplied && voucherDetails) {
      sessionStorage.setItem(
        "pelum_checkout_voucher",
        JSON.stringify(voucherDetails)
      );
    } else {
      sessionStorage.removeItem("pelum_checkout_voucher");
    }
    router.push("/checkout");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <SearchBar />
        <main style={{ background: C.surface, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} color={C.primary} className="animate-spin" />
        </main>
        <Footer />
      </>
    );
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
              <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>Yuk, temukan produk daur ulang pilihan dan mulai belanja!</p>
              <Link href="/" style={{ marginTop: 8, background: C.primary, color: "white", borderRadius: 8, padding: "10px 28px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
                Mulai Belanja
              </Link>
            </div>
          ) : (
            /* ── Main Grid ── */
            <div className="cart-grid">

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
                      onClick={removeChecked}
                      style={{ marginLeft: "auto", fontSize: "0.8rem", fontWeight: 600, color: "#EF4444", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Trash2 size={14} />
                      Hapus Dipilih
                    </button>
                  )}
                </div>

                {/* Items */}
                {items.map((item) => (
                  <div 
                    key={item.id_cart_item} 
                    className={`bg-white border rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start transition duration-200 ${
                      item.checked ? "border-primary/60 ring-1 ring-primary/10" : "border-surface-container"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id_cart_item)}
                      className="w-4 h-4 accent-primary cursor-pointer mt-1 md:mt-1.5 flex-shrink-0"
                    />

                    {/* Product Image */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F8F6F4] border border-surface-container flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[#8E8680] uppercase tracking-wider mb-0.5">
                            {item.seller}
                          </p>
                          <Link 
                            href={`/produk/${item.slug || item.id_produk}`} 
                            className="text-sm md:text-base font-bold text-on-surface hover:text-primary transition line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <button onClick={() => removeItem(item.id_cart_item)} className="text-secondary hover:text-red-500 p-1 flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Price + Qty + Subtotal Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 pt-2 border-t border-surface-container/50">
                        <div>
                          <span className="text-base font-extrabold text-primary">
                            {fmtPrice(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          {/* Qty Controls */}
                          <div className="flex items-center border border-border-strong rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => updateQty(item.id_cart_item, -1)}
                              disabled={item.qty <= 1}
                              className="w-8 h-8 flex items-center justify-center text-on-surface disabled:text-secondary disabled:cursor-not-allowed hover:bg-surface-container transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-9 text-center text-sm font-bold text-on-surface">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id_cart_item, 1)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="text-right sm:text-left min-w-[80px]">
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mb-0.5">Subtotal</p>
                            <p className="text-xs font-bold text-on-surface">{fmtPrice(item.price * item.qty)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}



                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: <ShieldCheck size={18} className="text-primary" />, title: "Pembayaran Aman", desc: "Data transaksi terenkripsi SSL" },
                    { icon: <Truck size={18} className="text-primary" />, title: "Pengiriman Terjamin", desc: "Estimasi 2–5 hari kerja" },
                  ].map((b, i) => (
                    <div key={i} className="bg-primary-container border border-orange-100 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="shrink-0">{b.icon}</div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{b.title}</p>
                        <p className="text-[10px] text-secondary">{b.desc}</p>
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
                    onClick={handleCheckout}
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
                    <Link href="/bantuan/syarat-ketentuan" style={{ color: C.primary, textDecoration: "none", fontWeight: 600 }}>Syarat &amp; Ketentuan</Link>
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
                <p style={{ fontSize: "0.8125rem", color: C.textMuted, margin: 0 }}>Produk daur ulang pilihan yang mungkin kamu suka</p>
              </div>
              <Link href="/" style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.primary, textDecoration: "none" }}>
                Lihat Semua →
              </Link>
            </div>
            <div className="products-grid-reco">
              {recommended.map((p) => (
                <Link key={p.id} href={`/produk/${p.slug}`} style={{
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
