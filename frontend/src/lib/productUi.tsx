import type { Product } from "@/backend/productService";
import Image from "next/image";
import { getVariantPriceBounds } from "@/lib/productVariants";

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sold: number;
  reviewCount: number;
  priceRange?: string;
}

export function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img);
      const first = Array.isArray(arr)
        ? arr.map((x) => String(x ?? "").trim()).find(Boolean)
        : null;
      return first || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

export function resolveProductImageSrc(input?: {
  cover_img?: string | null;
  img?: string | null;
} | null): string {
  if (!input) return "/product-keramik.png";
  if (input.cover_img?.trim()) return parseProductImg(input.cover_img);
  if (input.img?.trim()) return parseProductImg(input.img);
  return "/product-keramik.png";
}

/** URL gambar untuk disimpan di order_item (hindari base64 besar jika ada URL) */
export function extractProductCoverUrl(input?: {
  cover_img?: string | null;
  img?: string | null;
} | null): string | null {
  if (!input) return null;
  const cover = input.cover_img?.trim();
  if (cover && !cover.startsWith("data:")) {
    return cover.length <= 2048 ? cover : cover.slice(0, 2048);
  }
  const raw = input.img?.trim();
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) {
    return raw.length <= 2048 ? raw : raw.slice(0, 2048);
  }
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw) as unknown[];
      for (const item of arr) {
        const url = String(item ?? "").trim();
        if (url && !url.startsWith("data:") && (url.startsWith("http") || url.startsWith("/"))) {
          return url.length <= 2048 ? url : url.slice(0, 2048);
        }
      }
    } catch {
      return null;
    }
  }
  if (raw.startsWith("data:image")) return raw;
  return null;
}

/** Thumbnail kartu produk — mendukung base64 & URL biasa */
export function ProductGridImage({
  src,
  alt,
  sizes = "220px",
  style,
}: {
  src: string;
  alt: string;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  const resolved = parseProductImg(src);
  if (resolved.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
      />
    );
  }
  return (
    <Image src={resolved} alt={alt} fill style={{ objectFit: "cover", ...style }} sizes={sizes} />
  );
}

export function productToCard(
  p: Product,
  stats?: { rating: number; sold: number; reviewCount: number }
): ProductCard {
  let priceRange: string | undefined;
  if (p.variants && p.variants.length > 0) {
    const { min, max } = getVariantPriceBounds(p);
    if (min !== max) {
      priceRange = `Rp ${min.toLocaleString("id-ID")} - Rp ${max.toLocaleString("id-ID")}`;
    }
  }

  return {
    id: p.id_produk,
    slug: p.slug || p.id_produk,
    name: p.nama_produk,
    price: p.harga,
    image: resolveProductImageSrc({ img: p.img }),
    category: p.category || p.nama_brand || "Daur Ulang Lokal",
    rating: stats?.rating ?? 0,
    sold: stats?.sold ?? 0,
    reviewCount: stats?.reviewCount ?? 0,
    priceRange,
  };
}

/** Diskon tampilan promo (deterministik dari id produk, bukan tabel voucher) */
export function promoDiscountPercent(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash + productId.charCodeAt(i) * (i + 1)) % 100;
  }
  return 15 + (hash % 21);
}
