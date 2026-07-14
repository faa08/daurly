"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Store,
  ShieldCheck,
  Tag,
  MessageSquare,
  Share2,
  CheckCircle,
  Copy,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import EcoImpactDetails from "@/components/EcoImpactDetails";
import { productService, Product } from "@/backend/productService";
import { storeNameToSlug, type Seller } from "@/backend/sellerService";
import { authService } from "@/backend/authService";
import { cartService } from "@/backend/cartService";
import { returnService } from "@/backend/returnService";
import { orderService } from "@/backend/orderService";
import { supabase } from "@/backend/supabase";
import { productToCard, type ProductCard } from "@/lib/productUi";
import {
  formatVariantPriceRange,
  getGalleryImages,
  getSelectedVariantLabel,
  getSelectedVariantPrice,
  getSelectedVariantStock,
  getActiveVariantPicks,
  hasSelectedVariantPrice,
  isVisualVariantGroup,
  getSelectedVariantImage,
  getVariantPriceBounds,
} from "@/lib/productVariants";
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

interface Review {
  id: string;
  name: string;
  avatar: string;
  time: string;
  rating: number;
  text: string;
  image?: string | null;
}

function getProductDescription(product: Product): string {
  const desc = product.desc?.trim();
  if (desc) return desc;
  return `${product.nama_produk} adalah produk daur ulang dari Daurly. Setiap pembelian mendukung pengrajin dan pelaku usaha lokal Indonesia.`;
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
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCleanText, setCopiedCleanText] = useState(false);
  const [copiedAffText, setCopiedAffText] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetAction, setBottomSheetAction] = useState<"cart" | "buy">("cart");

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
    let cancelled = false;

    async function loadProduct() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const found = await productService.getProductBySlugOrId(slug, { includeImages: false });
        if (cancelled) return;

        if (found) {
          const mapped: Product = {
            id_produk: found.id_produk,
            id_seller: found.id_seller,
            nama_produk: found.nama_produk,
            sku: found.sku || "",
            category: found.category || "Daur Ulang",
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
            variantInventory: found.variantInventory,
          };
          setProduct(mapped);
          setActiveImg(0);

          const rawSeller = Array.isArray(found.seller) ? found.seller[0] : found.seller;
          if (rawSeller) setSeller(rawSeller as Seller);
          else setSeller(null);

          setLoading(false);

          const productId = found.id_produk;
          const kat = Array.isArray(found.kategori) ? found.kategori[0] : found.kategori;

          productService.hydrateProductDetailImages(productId).then((resolved) => {
            if (cancelled || !resolved) return;
            setProduct((prev) => {
              if (!prev || prev.id_produk !== productId) return prev;
              return { ...prev, img: resolved.cover, images: resolved.images };
            });
          });

          const [reviewList, similar] = await Promise.all([
            productService.getProductReviews(productId),
            productService.getSimilarProducts(productId, {
              id_kategori: kat?.id_kategori as string | undefined,
              sellerId: found.id_seller,
              categorySlug: found.categorySlug,
              limit: 5,
            }),
          ]);
          if (cancelled) return;

          setReviews(reviewList);
          const stats = await productService.getProductStats([
            productId,
            ...similar.map((p) => p.id_produk),
          ]);
          if (cancelled) return;

          setSoldCount(stats[productId]?.sold ?? 0);
          setSimilarProducts(similar.map((p) => productToCard(p, stats[p.id_produk])));

          const user = authService.getCurrentUser();
          setCurrentUser(user);
          const isPlaceholderEnv =
            !process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
          if (user && !isPlaceholderEnv) {
            const { data: orderItems } = await supabase
              .from("order_item")
              .select(`id_order, order!inner ( id_order, id_user, stat_order )`)
              .eq("id_produk", productId)
              .eq("order.id_user", user.id_user)
              .eq("order.stat_order", "selesai");

            if (cancelled) return;

            const selesaiOrder = orderItems?.[0]?.order;
            const orderId = Array.isArray(selesaiOrder)
              ? selesaiOrder[0]?.id_order
              : (selesaiOrder as unknown as { id_order?: string } | null)?.id_order;

            if (orderId) {
              const reviewed = await returnService.getReviewedProductIds(user.id_user, [productId]);
              if (cancelled) return;
              const already = reviewed.includes(productId);
              setHasReviewed(already);
              setCanReview(!already);
              setReviewOrderId(orderId);
            }
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (product && Object.keys(activeVariants).length > 0) {
      const variantImg = getSelectedVariantImage(product, activeVariants);
      if (variantImg) {
        const list = getGalleryImages(product, activeVariants);
        const idx = list.indexOf(variantImg);
        if (idx !== -1) {
          setActiveImg(idx);
        }
      }
    }
  }, [product, activeVariants]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShareProduct = () => {
    if (!product) return;
    const base = window.location.origin;
    const shareUrl = currentUser?.is_affiliate
      ? `${base}/produk/${product.slug}?ref=${currentUser.affiliate_code}`
      : `${base}/produk/${product.slug}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleShareProductClean = () => {
    if (!product) return;
    const base = window.location.origin;
    const shareUrl = `${base}/produk/${product.slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCleanText(true);
    setTimeout(() => setCopiedCleanText(false), 2000);
  };

  const handleShareProductAffiliate = () => {
    if (!product || !currentUser?.affiliate_code) return;
    const base = window.location.origin;
    const shareUrl = `${base}/produk/${product.slug}?ref=${currentUser.affiliate_code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedAffText(true);
    setTimeout(() => setCopiedAffText(false), 2000);
  };

  const handleNativeShare = () => {
    if (!product) return;
    const base = window.location.origin;
    const shareUrl = currentUser?.is_affiliate
      ? `${base}/produk/${product.slug}?ref=${currentUser.affiliate_code}`
      : `${base}/produk/${product.slug}`;

    const shareData = {
      title: product.nama_produk,
      text: `Lihat produk ${product.nama_produk} ini di Daurly!`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => console.log("Share failed", err));
    } else {
      const text = encodeURIComponent(`Lihat produk ${product.nama_produk} ini di Daurly! ${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const handleCtaClick = (action: "cart" | "buy") => {
    if (isMobile) {
      setBottomSheetAction(action);
      setIsBottomSheetOpen(true);
    } else {
      handleAddToCart(action === "buy");
    }
  };

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
      variantPicks: getActiveVariantPicks(product, activeVariants),
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

  const productDescription = product ? getProductDescription(product) : "";
  const galleryImages = product ? getGalleryImages(product, activeVariants) : [];
  const selectedStock = product ? getSelectedVariantStock(product, activeVariants) : 0;
  const { min: minPrice, max: maxPrice } = product ? getVariantPriceBounds(product) : { min: 0, max: 0 };
  const displayPrice =
    product && product.variants?.length
      ? formatPrice(minPrice)
      : product
        ? formatPrice(product.harga)
        : "Rp 125.000";

  const selectedVariantPrice = product
    ? formatPrice(getSelectedVariantPrice(product, activeVariants))
    : "Rp 125.000";

  const handleVariantSelect = (groupIndex: number, optionIndex: number) => {
    const next = { ...activeVariants, [groupIndex]: optionIndex };
    setActiveVariants(next);
    if (product) {
      const stock = getSelectedVariantStock(product, next);
      setQty((q) => Math.max(1, Math.min(q, stock > 0 ? stock : 1)));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="responsive-hide-desktop">
          <SearchBar />
        </div>
        <main style={{ background: "#FCFCFA", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              border: "3px solid #EAE5E0",
              borderTop: "3px solid #16A34A",
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
      <div className="responsive-hide-desktop">
        <SearchBar />
      </div>

      {/* Main content area */}
      <main className="pd-main">
        <div className="pd-container">

          {/* ── Breadcrumb ── */}
          <nav className="pd-breadcrumb">
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
          <div className="pd-top-grid">

            {/* Left: Image Gallery */}
            <div className="pd-images">
              {/* Main Image */}
              <div className="pd-main-img" style={{ position: "relative" }}>
                <img
                  src={
                    product
                      ? galleryImages[activeImg] || galleryImages[0] || product.img
                      : THUMBNAILS[activeImg]
                  }
                  alt={product ? product.nama_produk : "Mangkuk Keramik Motif Batik"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Floating Share Bar (Shopee Style) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255, 255, 255, 0.95)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 20,
                  }}
                >
                  <button
                    onClick={handleNativeShare}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#16A34A",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                    }}
                    title="Bagikan"
                  >
                    <Share2 size={15} />
                  </button>
                  <div style={{ width: 1, height: 14, background: "#EAE5E0" }} />
                  <button
                    onClick={handleShareProductClean}
                    style={{
                      background: "none",
                      border: "none",
                      color: copiedCleanText ? "#15803D" : "#5C5550",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copiedCleanText ? (
                      <>
                        <CheckCircle size={13} className="text-green-600" />
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>

                {((product && galleryImages.length > 1) || (!product && THUMBNAILS.length > 1)) && (
                  <>
                    <button
                      type="button"
                      className="pd-nav-arrow left"
                      onClick={() => {
                        const total = product ? galleryImages.length : THUMBNAILS.length;
                        setActiveImg((prev) => (prev - 1 + total) % total);
                      }}
                      aria-label="Gambar sebelumnya"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="pd-nav-arrow right"
                      onClick={() => {
                        const total = product ? galleryImages.length : THUMBNAILS.length;
                        setActiveImg((prev) => (prev + 1) % total);
                      }}
                      aria-label="Gambar berikutnya"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product && galleryImages.length > 0 ? (
                <div className="pd-thumbnails">
                  {galleryImages.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`pd-thumb${activeImg === i ? " active" : ""}`}
                      type="button"
                    >
                      <img src={src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              ) : !product ? (
                <div className="pd-thumbnails">
                  {THUMBNAILS.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`pd-thumb${activeImg === i ? " active" : ""}`}
                      type="button"
                    >
                      <img src={src} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Right: Product Info */}
            <div className="pd-info">
              {/* Badge */}
              <span className="pd-badge-unggulan">{product ? product.category.toUpperCase() : "PRODUK UNGGULAN"}</span>

              {/* Product Name */}
              <h1 className="pd-product-name">
                {product ? product.nama_produk : "Mangkuk Keramik Motif Batik"}
              </h1>

              {/* Rating Row */}
              <div className="pd-rating-row">
                <div className="pd-stars">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} fill={Number(averageRating) >= i ? "#F59E0B" : "none"} color={Number(averageRating) >= i ? "#F59E0B" : "#D5CFC9"} />
                  ))}
                </div>
                <span className="pd-rating-text">{averageRating} | {totalReviews} Ulasan</span>
                <span className="pd-divider-dot">·</span>
                <span className="pd-sold-text">
                  Stok: {selectedStock}
                </span>
                <span className="pd-divider-dot">·</span>
                <span className="pd-sold-text">
                  Terjual {soldCount}
                </span>
              </div>

              {/* Price */}
              <div className="pd-price">
                {displayPrice}
              </div>

              {product?.variants && product.variants.length > 0 && getSelectedVariantLabel(product, activeVariants) && (
                <p style={{ fontSize: "0.75rem", color: "#8E8680", margin: "-8px 0 0 0" }}>
                  Pilihan: <span style={{ color: "#1F1B18", fontWeight: 600 }}>{getSelectedVariantLabel(product, activeVariants)}</span>
                </p>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "#EAE5E0" }} />

              {/* Varian & Jumlah (hanya tampil di desktop) */}
              {!isMobile && (
                <>
                  {/* Varian ala marketplace */}
                  {product?.variants && product.variants.length > 0 ? (
                    product.variants.map((v, vIdx) => {
                      const isVisual = isVisualVariantGroup(product, vIdx);
                      return (
                      <div key={vIdx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", margin: 0, textTransform: "uppercase" }}>
                          {v.label}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            maxHeight: isVisual && v.options.length > 6 ? 220 : undefined,
                            overflowY: isVisual && v.options.length > 6 ? "auto" : undefined,
                            paddingRight: isVisual && v.options.length > 6 ? 4 : 0,
                          }}
                        >
                          {v.options.map((opt, optIdx) => {
                            const isSelected = (activeVariants[vIdx] ?? 0) === optIdx;
                            const showThumb = Boolean(opt.image?.trim());

                            const isCombinationOutOfStock = product
                              ? (product.variantInventory?.length
                                ? getSelectedVariantStock(product, { ...activeVariants, [vIdx]: optIdx }) === 0
                                : product.stok === 0)
                              : false;

                            const isOptionCompletelyOutOfStock = product
                              ? (product.variantInventory?.length
                                ? !product.variantInventory.some((entry) => entry.picks[vIdx] === optIdx && entry.stock > 0)
                                : product.stok === 0)
                              : false;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isOptionCompletelyOutOfStock}
                                onClick={() => handleVariantSelect(vIdx, optIdx)}
                                style={{
                                  display: "flex",
                                  flexDirection: showThumb ? "column" : "row",
                                  alignItems: "center",
                                  justifyContent: showThumb ? "flex-start" : "center",
                                  gap: showThumb ? 4 : 8,
                                  minHeight: showThumb ? 88 : 40,
                                  width: showThumb ? 72 : undefined,
                                  padding: showThumb ? "6px 6px 8px" : "0 14px",
                                  borderRadius: 4,
                                  border: isSelected
                                    ? "1.5px solid #16A34A"
                                    : isCombinationOutOfStock
                                      ? "1px dashed #D5CFC9"
                                      : "1px solid #D5CFC9",
                                  fontSize: showThumb ? "0.625rem" : "0.8125rem",
                                  fontWeight: 600,
                                  color: isSelected
                                    ? "#16A34A"
                                    : isCombinationOutOfStock
                                      ? "#A19993"
                                      : "#1F1B18",
                                  background: isSelected
                                    ? "#F0FDF4"
                                    : isCombinationOutOfStock
                                      ? "#F5F3F0"
                                      : "white",
                                  cursor: isOptionCompletelyOutOfStock ? "not-allowed" : "pointer",
                                  opacity: isOptionCompletelyOutOfStock ? 0.45 : (isCombinationOutOfStock && !isSelected ? 0.6 : 1),
                                  transition: "all 0.15s",
                                  fontFamily: "inherit",
                                  textAlign: "center",
                                }}
                              >
                                {showThumb ? (
                                  <img
                                    src={opt.image}
                                    alt={opt.name}
                                    style={{
                                      width: 56,
                                      height: 56,
                                      objectFit: "cover",
                                      borderRadius: 2,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : null}
                                <span style={{ lineHeight: 1.2, wordBreak: "break-word" }}>{opt.name}</span>
                                {!showThumb && opt.price != null && opt.price > 0 ? (
                                  <span style={{ fontSize: "0.6875rem", color: "#8E8680", fontWeight: 500 }}>
                                    {formatPrice(opt.price)}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })
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
                                boxShadow: activeColor === i ? `0 0 0 3px white, 0 0 0 5px #16A34A` : "none",
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
                                border: activeSize === i ? "1.5px solid #16A34A" : "1.5px solid #D5CFC9",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: activeSize === i ? "#16A34A" : "#5C5550",
                                background: activeSize === i ? "#F0FDF4" : "white",
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
                          onClick={() => setQty((q) => Math.min(selectedStock || 99, q + 1))}
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
                      <span style={{ fontSize: "0.75rem", color: selectedStock > 0 ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                        {selectedStock > 0 ? `Stok tersedia: ${selectedStock} unit` : "Stok habis untuk varian ini"}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* CTA Buttons */}
              <div className="pd-cta-row">
                <button
                  type="button"
                  onClick={openCustomerService}
                  className="pd-btn-chat"
                  title="Chat dengan Admin"
                >
                  <MessageSquare size={20} strokeWidth={2.25} />
                  <span className="pd-btn-chat-label pd-btn-chat-label--desktop">
                    Chat
                    <br />
                    dengan Admin
                  </span>
                  <span className="pd-btn-chat-label pd-btn-chat-label--mobile">Chat</span>
                </button>
                <button
                  id="add-to-cart"
                  onClick={() => handleCtaClick("cart")}
                  disabled={addingCart}
                  className="pd-btn-cart"
                  type="button"
                >
                  <ShoppingCart size={18} className="pd-btn-icon" />
                  <span className="pd-btn-label pd-btn-label--full">
                    {addingCart ? "Menambahkan..." : "Tambah ke Keranjang"}
                  </span>
                  <span className="pd-btn-label pd-btn-label--short">
                    {addingCart ? "..." : "Keranjang"}
                  </span>
                </button>
                <button
                  id="buy-now"
                  onClick={() => handleCtaClick("buy")}
                  disabled={addingCart}
                  className="pd-btn-buy"
                  type="button"
                  style={{ cursor: addingCart ? "not-allowed" : "pointer" }}
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* ── Info + Seller Grid ── */}
          <div className="pd-bottom-grid">

            {/* Left Column */}
            <div className="pd-left-col">

              {/* Deskripsi Produk */}
              <div style={{ background: "white", border: "1px solid #EAE5E0", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F1B18", margin: "0 0 12px 0" }}>Deskripsi Produk</h2>
                <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                  {productDescription || "—"}
                </p>
              </div>

              {/* Eco Impact & Material Breakdown */}
              {product && (
                <EcoImpactDetails bahan={product.bahan} berat={product.berat} />
              )}

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
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16A34A", margin: "0 0 6px" }}>Mengunggah Foto: {reviewUploadProgress}%</p>
                            <div style={{ width: "100%", height: 6, background: "#EAE5E0", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${reviewUploadProgress}%`, height: "100%", background: "#16A34A", transition: "width 0.1s" }} />
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
                        background: (reviewUploadProgress !== null && reviewUploadProgress < 100) ? "#D5CFC9" : "#16A34A",
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
                      <Link href="/account/orders" style={{ color: "#16A34A", fontWeight: 700 }}>Pesanan Saya</Link>{" "}
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
                        background: rev.avatar === "SR" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #16A34A, #15803D)",
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
            <div className="pd-right-col">

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
                      {seller?.nm_store || "Toko Daur Ulang"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#8E8680", marginTop: 2, margin: "2px 0 0 0" }}>
                      {seller?.addr
                        ? seller.addr.split(",").slice(0, 2).join(",").trim()
                        : "Daurly Indonesia"}
                    </p>
                  </div>
                </div>
                {seller?.is_verified !== false && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: "#16A34A" }}>
                    <ShieldCheck size={14} color="#16A34A" />
                    <span>Pelapak Terverifikasi</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <Link
                    href={seller?.id_seller ? `/toko/${seller.id_seller}` : "#"}
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
                  <Tag size={14} color="#16A34A" />
                  <span>Tentang Toko</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#5C5550", lineHeight: 1.6, margin: 0 }}>
                  {seller?.deskripsi?.trim()
                    || "Toko mitra daur ulang di Daurly — produk asli buatan pengrajin dan pelaku usaha lokal Indonesia."}
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
          <div className="pd-similar-section">
            <h2 className="pd-section-title">Produk Serupa</h2>
            <div className="pd-similar-grid">
              {similarProducts.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "#8E8680", gridColumn: "1 / -1" }}>Belum ada produk serupa.</p>
              ) : similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/produk/${p.slug}`}
                  className="pd-similar-card"
                >
                  <div className="pd-similar-img">
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div className="pd-similar-info">
                    <h3 className="pd-similar-name">{p.name}</h3>
                    <p className="pd-similar-price">
                      {formatPrice(p.price)}
                    </p>
                    <div className="pd-similar-meta">
                      <span className="pd-similar-star">★</span>
                      <span>{p.rating}</span>
                      <span className="pd-similar-sep">·</span>
                      <span>{p.sold} terjual</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM SHEET FOR MOBILE VARIANTS */}
      {isMobile && isBottomSheetOpen && product && (
        <>
          {/* Keyframe injection for slideUp and fadeIn */}
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .bottom-sheet-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.6);
              z-index: 1000;
              display: flex;
              align-items: flex-end;
              animation: fadeIn 0.25s ease-out;
            }
            .bottom-sheet-container {
              width: 100%;
              max-height: 80vh;
              background: white;
              border-top-left-radius: 16px;
              border-top-right-radius: 16px;
              padding: 20px;
              display: flex;
              flex-direction: column;
              gap: 16px;
              box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
              animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .bottom-sheet-content {
              overflow-y: auto;
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 16px;
              padding-bottom: 16px;
            }
          `}</style>

          <div className="bottom-sheet-backdrop" onClick={() => setIsBottomSheetOpen(false)}>
            <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
              
              {/* Header: Product details summary */}
              <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #EAE5E0", paddingBottom: 16 }}>
                <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", border: "1px solid #EAE5E0", flexShrink: 0 }}>
                  <img
                    src={
                      galleryImages[activeImg] || galleryImages[0] || product.img || THUMBNAILS[0]
                    }
                    alt={product.nama_produk}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#16A34A" }}>
                    {selectedVariantPrice}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#8E8680", marginTop: 4 }}>
                    Stok: {selectedStock}
                  </span>
                  {product.variants && product.variants.length > 0 && getSelectedVariantLabel(product, activeVariants) && (
                    <span style={{ fontSize: "0.75rem", color: "#5C5550", marginTop: 2 }}>
                      Pilihan: <strong>{getSelectedVariantLabel(product, activeVariants)}</strong>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#A19993",
                    cursor: "pointer",
                    padding: 4,
                    alignSelf: "flex-start",
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Content: Variants & Quantity */}
              <div className="bottom-sheet-content">
                {product.variants && product.variants.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {product.variants.map((v, vIdx) => {
                      const isVisual = isVisualVariantGroup(product, vIdx);
                      return (
                        <div key={vIdx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", margin: 0, textTransform: "uppercase" }}>
                            {v.label}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {v.options.map((opt, optIdx) => {
                              const isSelected = (activeVariants[vIdx] ?? 0) === optIdx;
                              const showThumb = Boolean(opt.image?.trim());
                              
                              const isCombinationOutOfStock = product.variantInventory?.length
                                ? getSelectedVariantStock(product, { ...activeVariants, [vIdx]: optIdx }) === 0
                                : product.stok === 0;

                              const isOptionCompletelyOutOfStock = product.variantInventory?.length
                                ? !product.variantInventory.some((entry) => entry.picks[vIdx] === optIdx && entry.stock > 0)
                                : product.stok === 0;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isOptionCompletelyOutOfStock}
                                  onClick={() => handleVariantSelect(vIdx, optIdx)}
                                  style={{
                                    display: "flex",
                                    flexDirection: showThumb ? "column" : "row",
                                    alignItems: "center",
                                    justifyContent: showThumb ? "flex-start" : "center",
                                    gap: showThumb ? 4 : 8,
                                    minHeight: showThumb ? 80 : 36,
                                    width: showThumb ? 68 : undefined,
                                    padding: showThumb ? "4px 4px 6px" : "0 12px",
                                    borderRadius: 6,
                                    border: isSelected
                                      ? "1.5px solid #16A34A"
                                      : isCombinationOutOfStock
                                        ? "1px dashed #D5CFC9"
                                        : "1px solid #D5CFC9",
                                    fontSize: showThumb ? "0.625rem" : "0.75rem",
                                    fontWeight: 600,
                                    color: isSelected ? "#16A34A" : isCombinationOutOfStock ? "#A19993" : "#1F1B18",
                                    background: isSelected ? "#F0FDF4" : isCombinationOutOfStock ? "#F5F3F0" : "white",
                                    cursor: isOptionCompletelyOutOfStock ? "not-allowed" : "pointer",
                                    opacity: isOptionCompletelyOutOfStock ? 0.45 : (isCombinationOutOfStock && !isSelected ? 0.6 : 1),
                                    transition: "all 0.15s",
                                    fontFamily: "inherit",
                                  }}
                                >
                                  {showThumb && (
                                    <img
                                      src={opt.image}
                                      alt={opt.name}
                                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
                                    />
                                  )}
                                  <span>{opt.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quantity Selector inside Sheet */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#5C5550", flex: 1 }}>Jumlah</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #D5CFC9", borderRadius: 4, overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      style={{ width: 32, height: 32, border: "none", background: "#F5F3F0", cursor: "pointer", fontSize: "1rem", color: "#5C5550" }}
                    >
                      −
                    </button>
                    <span style={{ width: 40, textAlign: "center", fontSize: "0.875rem", fontWeight: 700 }}>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(selectedStock || 99, q + 1))}
                      style={{ width: 32, height: 32, border: "none", background: "#F5F3F0", cursor: "pointer", fontSize: "1rem", color: "#5C5550" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button: Confirm */}
              <button
                onClick={async () => {
                  setIsBottomSheetOpen(false);
                  await handleAddToCart(bottomSheetAction === "buy");
                }}
                disabled={addingCart || selectedStock === 0}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: selectedStock === 0 ? "#A19993" : "#4C1D95",
                  color: "white",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: selectedStock === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  boxShadow: "0 4px 12px rgba(76, 29, 149, 0.2)",
                }}
              >
                {addingCart ? "Memproses..." : selectedStock === 0 ? "Stok Habis" : bottomSheetAction === "buy" ? "Beli Sekarang" : "Masukkan Keranjang"}
              </button>

            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
