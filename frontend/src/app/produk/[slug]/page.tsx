"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  ChevronRight,
  Store,
  ShieldCheck,
  Tag,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { productService, Product } from "@/backend/productService";
import { storeNameToSlug, type Seller } from "@/backend/sellerService";
import { authService } from "@/backend/authService";
import { cartService } from "@/backend/cartService";
import { returnService } from "@/backend/returnService";
import { orderService } from "@/backend/orderService";
import { supabase } from "@/backend/supabase";
import { productToCard, type ProductCard } from "@/lib/productUi";
import { useCustomerService } from "@/components/CustomerServiceProvider";

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

function formatPrice(p: number) {
  return `Rp ${p.toLocaleString("id-ID")}`;
}

function getVariantPriceRange(product: Product): string {
  const prices = new Set<number>([product.harga]);
  product.variants?.forEach((g) => {
    g.options.forEach((o) => {
      if (o.price != null && o.price > 0) prices.add(o.price);
    });
  });
  const arr = [...prices].sort((a, b) => a - b);
  if (arr.length <= 1) return formatPrice(arr[0]);
  return `${formatPrice(arr[0])} - ${formatPrice(arr[arr.length - 1])}`;
}

function getSelectedVariantPrice(product: Product, activeVariants: Record<number, number>): number {
  let price = product.harga;
  product.variants?.forEach((group, gi) => {
    const oi = activeVariants[gi] ?? 0;
    const opt = group.options[oi];
    if (opt?.price != null && opt.price > 0) price = opt.price;
  });
  return price;
}

function getSelectedVariantLabel(product: Product, activeVariants: Record<number, number>): string {
  if (!product.variants?.length) return "";
  return product.variants
    .map((g, gi) => {
      const oi = activeVariants[gi] ?? 0;
      return g.options[oi]?.name;
    })
    .filter(Boolean)
    .join(", ");
}

interface Review {
  id: string;
  name: string;
  avatar: string;
  time: string;
  rating: number;
  text: string;
  image?: string | null;
}

function isWeakDetailText(value?: string | null): boolean {
  if (!value?.trim()) return true;
  const t = value.trim();
  if (t === "-" || t === "—") return true;
  if (t.length <= 3 && /^[a-z]+$/i.test(t)) return true;
  return false;
}

function buildProductInfoDisplay(product: Product) {
  const cat = (product.category || "").toLowerCase();
  const isKeramik = cat.includes("keramik") || cat.includes("kerajinan");
  const isTekstil = cat.includes("batik") || cat.includes("tekstil") || cat.includes("kain");

  let bahan = product.bahan?.trim();
  if (isWeakDetailText(bahan)) {
    if (isKeramik) bahan = "Keramik food-grade, aman untuk makanan & minuman";
    else if (isTekstil) bahan = "Kain katun / rayon premium, nyaman di kulit";
    else bahan = "Bahan pilihan berkualitas dari pengrajin UMKM";
  }

  let asal = product.asal_produk?.trim();
  if (isWeakDetailText(asal)) {
    asal = "Buatan tangan pengrajin lokal Indonesia";
  }

  let berat: string;
  if (product.berat && product.berat > 0) {
    berat = `${product.berat.toLocaleString("id-ID")} gram`;
  } else if (isKeramik) {
    berat = "Estimasi 400–800 gram (tergantung ukuran)";
  } else {
    berat = "Estimasi 300–600 gram";
  }

  let ketahanan = product.ketahanan?.trim();
  if (isWeakDetailText(ketahanan)) {
    if (isKeramik) ketahanan = "Tahan panas ringan, hindari benturan keras";
    else if (isTekstil) ketahanan = "Warna tahan luntur dengan perawatan sesuai label";
    else ketahanan = "Dirancang untuk pemakaian harian dengan perawatan rutin";
  }

  let deskripsi = product.desc?.trim();
  if (isWeakDetailText(deskripsi)) {
    deskripsi =
      `${product.nama_produk} adalah produk unggulan UMKM yang diproduksi secara teliti oleh pengrajin lokal. ` +
      "Setiap unit melalui pengecekan kualitas sebelum dikirim. Dengan membeli produk ini, Anda turut mendukung ekonomi kreatif dan pelestarian kerajinan Indonesia.";
  }
  const extra = product.info_tambahan?.trim();
  if (!isWeakDetailText(extra) && extra && !deskripsi.includes(extra)) {
    deskripsi = `${deskripsi}\n\n${extra}`;
  }

  return { bahan, asal, berat, ketahanan, deskripsi };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { open: openCustomerService } = useCustomerService();
  const slug = params ? (Array.isArray(params.slug) ? params.slug[0] : params.slug) : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [activeVariants, setActiveVariants] = useState<{ [key: number]: number }>({});
  const [qty, setQty] = useState(1);

  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState(0);

  const [similarProducts, setSimilarProducts] = useState<ProductCard[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewFileName, setReviewFileName] = useState("");
  const [reviewUploadProgress, setReviewUploadProgress] = useState<number | null>(null);
  const [reviewImgUrl, setReviewImgUrl] = useState<string | null>(null);
  const [soldCount, setSoldCount] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const found = await productService.getProductBySlugOrId(slug);
        if (found) {
          const mapped: Product = {
            id_produk: found.id_produk,
            id_seller: found.id_seller,
            nama_produk: found.nama_produk,
            sku: found.sku || "",
            category: found.category || "UMKM",
            categorySlug: found.categorySlug,
            slug: found.slug,
            harga: found.harga,
            stok: found.stok ?? found.produk_stock ?? 0,
            status: found.status || "Aktif",
            img: found.img,
            images: found.images,
            desc: found.desc || "",
            created_at: found.created_at || "",
            berat: found.berat,
            bahan: found.bahan,
            asal_produk: found.asal_produk,
            ketahanan: found.ketahanan,
            info_tambahan: found.info_tambahan,
            variants: found.variants,
          };
          setProduct(mapped);
          setActiveImg(0);

          const rawSeller = Array.isArray(found.seller) ? found.seller[0] : found.seller;
          if (rawSeller) setSeller(rawSeller as Seller);
          else setSeller(null);

          const [reviewList, similar] = await Promise.all([
            productService.getProductReviews(found.id_produk),
            productService.getSimilarProducts(
              found.id_produk,
              found.categorySlug,
              found.id_seller,
              5
            ),
          ]);
          setReviews(reviewList);
          const stats = await productService.getProductStats([
            found.id_produk,
            ...similar.map((p) => p.id_produk),
          ]);
          setSoldCount(stats[found.id_produk]?.sold ?? 0);
          setSimilarProducts(similar.map((p) => productToCard(p, stats[p.id_produk])));

          const user = authService.getCurrentUser();
          const isPlaceholder =
            !process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
          if (user && !isPlaceholder) {
            const { data: orderItems } = await supabase
              .from("order_item")
              .select(`id_order, order!inner ( id_order, id_user, stat_order )`)
              .eq("id_produk", found.id_produk)
              .eq("order.id_user", user.id_user)
              .eq("order.stat_order", "selesai");

            const selesaiOrder = orderItems?.[0]?.order;
            const orderId = Array.isArray(selesaiOrder)
              ? selesaiOrder[0]?.id_order
              : (selesaiOrder as unknown as { id_order?: string } | null)?.id_order;

            if (orderId) {
              const reviewed = await returnService.getReviewedProductIds(user.id_user, [found.id_produk]);
              const already = reviewed.includes(found.id_produk);
              setHasReviewed(already);
              setCanReview(!already);
              setReviewOrderId(orderId);
            }
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.variants?.length) {
      const initial: Record<number, number> = {};
      product.variants.forEach((_, i) => {
        initial[i] = 0;
      });
      setActiveVariants(initial);
    }
  }, [product?.id_produk, product?.variants]);

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!product) return;
    const user = authService.getCurrentUser();
    if (!user) {
      router.push(`/masuk?redirect=/produk/${slug}`);
      return;
    }
    setAddingCart(true);
    const result = await cartService.addToCart(user.id_user, product.id_produk, qty, {
      setQty: redirectToCheckout,
    });
    if (!result.ok) {
      setAddingCart(false);
      alert(result.error || "Gagal menambahkan ke keranjang.");
      return;
    }
    if (redirectToCheckout) {
      const cartItemId =
        result.cartItemId ||
        (await cartService.getCartItems(user.id_user)).find((i) => i.id_produk === product.id_produk)
          ?.id_cart_item;
      if (!cartItemId) {
        setAddingCart(false);
        alert("Gagal menyiapkan checkout. Coba lagi dari keranjang.");
        return;
      }
      orderService.saveCheckoutSession([cartItemId]);
      router.push("/checkout");
    } else {
      alert("Produk ditambahkan ke keranjang!");
    }
    setAddingCart(false);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !product) return;

    const user = authService.getCurrentUser();
    if (!user) {
      router.push(`/masuk?redirect=/produk/${slug}`);
      return;
    }
    if (!reviewOrderId) {
      alert("Ulasan hanya bisa diberikan setelah pesanan selesai. Buka Pesanan Saya → tab Selesai.");
      return;
    }

    try {
      await returnService.submitReview({
        userId: user.id_user,
        orderId: reviewOrderId,
        productId: product.id_produk,
        rating: newRating,
        comment: newReviewText,
        photoReview: reviewImgUrl || undefined,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan ulasan.");
      return;
    }

    const updated = await productService.getProductReviews(product.id_produk);
    setReviews(updated);
    setCanReview(false);
    setHasReviewed(true);
    setNewReviewText("");
    setNewRating(5);
    setReviewFileName("");
    setReviewUploadProgress(null);
    setReviewImgUrl(null);
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0";

  const productInfo = product ? buildProductInfoDisplay(product) : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <SearchBar />
        <main style={{ background: "#FCFCFA", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              border: "3px solid #EAE5E0",
              borderTop: "3px solid #1D4ED8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{ fontSize: "0.875rem", color: "#8E8680", fontWeight: 600 }}>Memuat detail produk...</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </main>
        <Footer />
      </>
    );
  }

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
            <Link href={`/kategori/${product ? product.category.toLowerCase() : "kerajinan"}`} style={{ color: "#8E8680", textDecoration: "none" }}>
              {product ? product.category : "Kerajinan Tangan"}
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: "#1F1B18", fontWeight: 600 }}>
              {product ? product.nama_produk : "Mangkuk Keramik Motif Batik"}
            </span>
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
                <img
                  src={
                    product
                      ? (product.images && product.images[activeImg] ? product.images[activeImg] : product.img)
                      : THUMBNAILS[activeImg]
                  }
                  alt={product ? product.nama_produk : "Mangkuk Keramik Motif Batik"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Thumbnails */}
              {product && product.images && product.images.length > 0 ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        position: "relative",
                        width: 72,
                        height: 72,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: activeImg === i ? "2px solid #1D4ED8" : "2px solid transparent",
                        cursor: "pointer",
                        background: "#F8F6F4",
                        padding: 0,
                        flexShrink: 0,
                        transition: "border-color 0.15s",
                      }}
                    >
                      <img src={src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              ) : !product ? (
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
                        border: activeImg === i ? "2px solid #1D4ED8" : "2px solid transparent",
                        cursor: "pointer",
                        background: "#F8F6F4",
                        padding: 0,
                        flexShrink: 0,
                        transition: "border-color 0.15s",
                      }}
                    >
                      <img src={src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Right: Product Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Badge */}
              <span style={{
                display: "inline-block",
                background: "#1D4ED8",
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 3,
                letterSpacing: "0.05em",
                width: "fit-content",
              }}>{product ? product.category.toUpperCase() : "PRODUK UNGGULAN"}</span>

              {/* Product Name */}
              <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "#1F1B18", lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>
                {product ? product.nama_produk : "Mangkuk Keramik Motif Batik"}
              </h1>

              {/* Rating Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} fill={Number(averageRating) >= i ? "#F59E0B" : "none"} color={Number(averageRating) >= i ? "#F59E0B" : "#D5CFC9"} />
                  ))}
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#5C5550", fontWeight: 600 }}>{averageRating} | {totalReviews} Ulasan</span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>·</span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>
                  Stok: {product ? product.stok : 0}
                </span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>·</span>
                <span style={{ fontSize: "0.8125rem", color: "#8E8680" }}>
                  Terjual {soldCount}
                </span>
              </div>

              {/* Price */}
              <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1D4ED8", letterSpacing: "-0.02em" }}>
                {product?.variants?.some((g) => g.options.some((o) => o.price)) &&
                Object.keys(activeVariants).length > 0 &&
                getSelectedVariantPrice(product, activeVariants) !== product.harga
                  ? formatPrice(getSelectedVariantPrice(product, activeVariants))
                  : product
                    ? getVariantPriceRange(product)
                    : "Rp 125.000"}
              </div>

              {product?.variants && product.variants.length > 0 && getSelectedVariantLabel(product, activeVariants) && (
                <p style={{ fontSize: "0.75rem", color: "#8E8680", margin: "-8px 0 0 0" }}>
                  Pilihan: <span style={{ color: "#1F1B18", fontWeight: 600 }}>{getSelectedVariantLabel(product, activeVariants)}</span>
                </p>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "#EAE5E0" }} />

              {/* Varian ala marketplace */}
              {product?.variants && product.variants.length > 0 ? (
                product.variants.map((v, vIdx) => (
                  <div key={vIdx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", margin: 0 }}>{v.label}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {v.options.map((opt, optIdx) => {
                        const isSelected = (activeVariants[vIdx] ?? 0) === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setActiveVariants((prev) => ({ ...prev, [vIdx]: optIdx }))}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              minHeight: 40,
                              padding: opt.image ? "4px 12px 4px 4px" : "0 14px",
                              borderRadius: 4,
                              border: isSelected ? "1.5px solid #1D4ED8" : "1px solid #D5CFC9",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: isSelected ? "#1D4ED8" : "#1F1B18",
                              background: isSelected ? "#FFF7ED" : "white",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontFamily: "inherit",
                            }}
                          >
                            {opt.image ? (
                              <img
                                src={opt.image}
                                alt={opt.name}
                                style={{
                                  width: 32,
                                  height: 32,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  flexShrink: 0,
                                }}
                              />
                            ) : null}
                            <span>{opt.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : !product ? (
                <>
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
                            boxShadow: activeColor === i ? `0 0 0 3px white, 0 0 0 5px #1D4ED8` : "none",
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
                            border: activeSize === i ? "1.5px solid #1D4ED8" : "1.5px solid #D5CFC9",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: activeSize === i ? "#1D4ED8" : "#5C5550",
                            background: activeSize === i ? "#EFF6FF" : "white",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            fontFamily: "inherit",
                          }}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {/* Jumlah */}
              {product && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550" }}>Jumlah</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #D5CFC9", borderRadius: 4, overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      style={{
                        width: 32,
                        height: 32,
                        border: "none",
                        background: "#F5F3F0",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "#5C5550",
                      }}
                    >
                      −
                    </button>
                    <span style={{ width: 40, textAlign: "center", fontSize: "0.875rem", fontWeight: 700 }}>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.stok || 99, q + 1))}
                      style={{
                        width: 32,
                        height: 32,
                        border: "none",
                        background: "#F5F3F0",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "#5C5550",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: product.stok > 0 ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                    {product.stok > 0 ? `Stok tersedia: ${product.stok} unit` : "Stok habis"}
                  </span>
                </div>
              )}

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={openCustomerService}
                  style={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #D5CFC9",
                    borderRadius: 8,
                    color: "#5C5550",
                    background: "white",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  title="Customer Service"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  id="add-to-cart"
                  onClick={() => handleAddToCart(false)}
                  disabled={addingCart}
                  style={{
                    flex: 1,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    border: "2px solid #1D4ED8",
                    borderRadius: 8,
                    color: "#1D4ED8",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    background: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <ShoppingCart size={18} />
                  {addingCart ? "Menambahkan..." : "Tambah ke Keranjang"}
                </button>
                <button
                  id="buy-now"
                  onClick={() => handleAddToCart(true)}
                  disabled={addingCart}
                  style={{
                    flex: 1,
                    height: 48,
                    background: "#1D4ED8",
                    color: "white",
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: addingCart ? "not-allowed" : "pointer",
                    border: "none",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>{productInfo?.bahan ?? "—"}</span>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Asal Produk</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>{productInfo?.asal ?? "—"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 140px 1fr", gap: 8, fontSize: "0.8125rem" }}>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Berat</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>{productInfo?.berat ?? "—"}</span>
                    <span style={{ color: "#8E8680", fontWeight: 600 }}>Ketahanan</span>
                    <span style={{ color: "#1F1B18", fontWeight: 600 }}>{productInfo?.ketahanan ?? "—"}</span>
                  </div>
                </div>
                <div style={{ paddingTop: 12, borderTop: "1px solid #EAE5E0" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8E8680", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>
                    Deskripsi
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                    {productInfo?.deskripsi ?? "—"}
                  </p>
                </div>
              </div>

              {/* Review Form — hanya jika pesanan selesai & belum diulas */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>Ulasan Produk</h3>

                {hasReviewed ? (
                  <div style={{ padding: "16px 20px", background: "#EBFDF2", borderRadius: 8, border: "1px solid #BBF7D0" }}>
                    <p style={{ fontSize: "0.75rem", color: "#15803D", margin: 0, fontWeight: 600 }}>
                      ✓ Anda sudah memberikan ulasan untuk produk ini. Terima kasih!
                    </p>
                  </div>
                ) : canReview ? (
                  <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: 14, borderTop: "1.5px solid #F5F3F0", paddingTop: 16 }}>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>Beri Ulasan Produk</h4>
                    
                    {/* Star Rating Picker */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: "0.8125rem", color: "#5C5550", fontWeight: 700 }}>Rating Anda:</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isHighlighted = (hoverRating !== null ? hoverRating : newRating) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                            >
                              <Star
                                size={20}
                                fill={isHighlighted ? "#F59E0B" : "none"}
                                color={isHighlighted ? "#F59E0B" : "#D5CFC9"}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review text input */}
                    <div>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Tulis ulasan jujur Anda mengenai kualitas produk, kerapihan batik, dll..."
                        required
                        rows={3}
                        style={{ width: "100%", border: "1.5px solid #D5CFC9", borderRadius: 8, padding: 12, fontSize: "0.8125rem", fontFamily: "inherit", resize: "none", outline: "none", color: "#1F1B18" }}
                      />
                    </div>

                    {/* Image Upload for Review */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5C5550" }}>Unggah Foto Produk (Opsional)</span>
                      
                      <div style={{
                        border: "1.5px dashed #D5CFC9", borderRadius: 8, padding: 16,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        background: "#FCFCFA", position: "relative", cursor: "pointer", overflow: "hidden"
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setReviewFileName(file.name);
                              setReviewUploadProgress(0);
                              setReviewImgUrl(null);

                              let prog = 0;
                              const interval = setInterval(() => {
                                prog += 20;
                                setReviewUploadProgress(prog);
                                if (prog >= 100) {
                                  clearInterval(interval);
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setReviewImgUrl(ev.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }, 150);
                            }
                          }}
                        />
                        
                        {reviewUploadProgress === null && !reviewFileName && (
                          <>
                            <span className="material-symbols-outlined" style={{ color: "#8E8680", fontSize: "24px", marginBottom: 4 }}>add_photo_alternate</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1F1B18" }}>Pilih Foto Ulasan</span>
                            <span style={{ fontSize: "0.65rem", color: "#8E8680", marginTop: 2 }}>Format JPG, PNG (Maks. 2MB)</span>
                          </>
                        )}

                        {reviewUploadProgress !== null && reviewUploadProgress < 100 && (
                          <div style={{ width: "100%", textAlign: "center" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1D4ED8", margin: "0 0 6px" }}>Mengunggah Foto: {reviewUploadProgress}%</p>
                            <div style={{ width: "100%", height: 6, background: "#EAE5E0", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${reviewUploadProgress}%`, height: "100%", background: "#1D4ED8", transition: "width 0.1s" }} />
                            </div>
                          </div>
                        )}

                        {reviewUploadProgress === 100 && reviewFileName && (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803D" }}>✓ Foto Berhasil Diunggah!</span>
                            {reviewImgUrl && (
                              <div style={{ width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #EAE5E0" }}>
                                <img src={reviewImgUrl} alt="Review Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            )}
                            <span style={{ fontSize: "0.65rem", color: "#8E8680" }}>{reviewFileName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Review Button */}
                    <button
                      type="submit"
                      disabled={reviewUploadProgress !== null && reviewUploadProgress < 100}
                      style={{
                        height: 40,
                        background: (reviewUploadProgress !== null && reviewUploadProgress < 100) ? "#D5CFC9" : "#1D4ED8",
                        color: "white",
                        borderRadius: 8,
                        fontSize: "0.8125rem",
                        fontWeight: 800,
                        border: "none",
                        cursor: (reviewUploadProgress !== null && reviewUploadProgress < 100) ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <span>Kirim Ulasan Sekarang</span>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>send</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: "16px 20px", background: "#F5F3F0", borderRadius: 8, border: "1px solid #EAE5E0" }}>
                    <p style={{ fontSize: "0.75rem", color: "#5C5550", margin: 0, fontWeight: 600 }}>
                      Beli dan selesaikan pesanan untuk memberikan ulasan. Buka{" "}
                      <Link href="/account/orders" style={{ color: "#1D4ED8", fontWeight: 700 }}>Pesanan Saya</Link>{" "}
                      → tab Selesai.
                    </p>
                  </div>
                )}
              </div>

              {/* Reviews List Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #F5F3F0", paddingBottom: 12 }}>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>Ulasan Pembeli</h2>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#8E8680" }}>{reviews.length} Ulasan</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {reviews.map((rev) => (
                    <div key={rev.id} style={{ display: "flex", gap: 14, borderBottom: "1px solid #F5F3F0", paddingBottom: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: rev.avatar === "SR" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #1D4ED8, #1E40AF)",
                        color: "white", fontSize: "0.875rem", fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>{rev.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F1B18" }}>{rev.name}</span>
                          <span style={{ fontSize: "0.75rem", color: "#8E8680" }}>{rev.time}</span>
                        </div>
                        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={rev.rating >= i ? "#F59E0B" : "none"} color={rev.rating >= i ? "#F59E0B" : "#D5CFC9"} />)}
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, margin: 0 }}>
                          {rev.text}
                        </p>
                        {rev.image && (
                          <div style={{ marginTop: 10, width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #EAE5E0" }}>
                            <img src={rev.image} alt="Uploaded review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Seller Card */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {seller?.logo_toko ? (
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "1px solid #EAE5E0" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={seller.logo_toko} alt={seller.nm_store} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "linear-gradient(135deg, #92400E, #78350F)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Store size={20} color="white" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18", margin: 0 }}>
                      {seller?.nm_store || "Toko UMKM"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#8E8680", marginTop: 2, margin: "2px 0 0 0" }}>
                      {seller?.addr
                        ? seller.addr.split(",").slice(0, 2).join(",").trim()
                        : "Pelataran UMKM Indonesia"}
                    </p>
                  </div>
                </div>
                {seller?.is_verified !== false && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: "#1D4ED8" }}>
                    <ShieldCheck size={14} color="#1D4ED8" />
                    <span>Pelapak Terverifikasi</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <Link
                    href={seller?.nm_store ? `/toko/${storeNameToSlug(seller.nm_store)}` : "#"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 38,
                      border: "1.5px solid #D5CFC9",
                      borderRadius: 6,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#1F1B18",
                      textDecoration: "none",
                      pointerEvents: seller?.nm_store ? "auto" : "none",
                      opacity: seller?.nm_store ? 1 : 0.5,
                    }}
                  >
                    Kunjungi Toko
                  </Link>
                </div>
              </div>

              {/* Tentang Toko */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 800, color: "#1F1B18" }}>
                  <Tag size={14} color="#1D4ED8" />
                  <span>Tentang Toko</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, margin: 0 }}>
                  {seller?.deskripsi?.trim()
                    || "Toko mitra UMKM di Pelataran UMKM — produk asli buatan pengrajin dan pelaku usaha lokal Indonesia."}
                </p>
                {seller?.no_telp && (
                  <p style={{ fontSize: "0.75rem", color: "#8E8680", margin: 0 }}>
                    Kontak: {seller.no_telp}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Similar Products ── */}
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", marginBottom: 20 }}>Produk Serupa</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
              {similarProducts.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "#8E8680", gridColumn: "1 / -1" }}>Belum ada produk serupa.</p>
              ) : similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/produk/${p.slug}`}
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
                    <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1D4ED8", marginBottom: 6, margin: "0 0 6px 0" }}>
                      {formatPrice(p.price)}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "#8E8680" }}>
                      <span style={{ color: "#1D4ED8", fontSize: "0.8rem" }}>★</span>
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
