import type { Product } from "@/backend/productService";
import { getStockForPicks } from "@/lib/variantInventory";

export function getSelectedVariantOptions(
  product: Product,
  activeVariants: Record<number, number>
) {
  return (
    product.variants?.map((group, gi) => {
      const oi = activeVariants[gi] ?? 0;
      return group.options[oi] ?? null;
    }) ?? []
  );
}

/** Gambar dari varian terpilih (prioritas kombinasi varian jika ada, lalu fallback ke grup opsi pertama) */
export function getSelectedVariantImage(
  product: Product,
  activeVariants: Record<number, number>
): string | null {
  if (product.variantInventory?.length && product.variants?.length) {
    const picks = product.variants.map((_, gi) => activeVariants[gi] ?? 0);
    const key = picks.join(",");
    const found = product.variantInventory.find((e) => e.picks.join(",") === key);
    if (found?.image?.trim()) {
      return found.image.trim();
    }
  }

  if (!product.variants?.length) return null;

  for (let gi = 0; gi < product.variants.length; gi++) {
    const opt = product.variants[gi].options[activeVariants[gi] ?? 0];
    const img = opt?.image?.trim();
    if (img) return img;
  }
  return null;
}

/** Harga efektif: harga dasar, diganti kombinasi varian jika ada, atau opsi terakhir yang punya harga > 0 */
export function getSelectedVariantPrice(
  product: Product,
  activeVariants: Record<number, number>
): number {
  if (product.variantInventory?.length && product.variants?.length) {
    const picks = product.variants.map((_, gi) => activeVariants[gi] ?? 0);
    const key = picks.join(",");
    const found = product.variantInventory.find((e) => e.picks.join(",") === key);
    if (found?.price != null && found.price > 0) {
      return found.price;
    }
  }

  let price = product.harga;

  product.variants?.forEach((group, gi) => {
    const opt = group.options[activeVariants[gi] ?? 0];
    if (opt?.price != null && opt.price > 0) {
      price = opt.price;
    }
  });

  return price;
}

export function getVariantPriceBounds(product: Product): { min: number; max: number } {
  const prices = new Set<number>();

  // 1. Check combination-level prices
  product.variantInventory?.forEach((e) => {
    if (e.price != null && e.price > 0) {
      prices.add(e.price);
    }
  });

  // 2. Check option-level prices if no combination-level prices found
  if (prices.size === 0) {
    product.variants?.forEach((g) => {
      g.options.forEach((o) => {
        if (o.price != null && o.price > 0) prices.add(o.price);
      });
    });
  }

  if (prices.size === 0) {
    return { min: product.harga, max: product.harga };
  }
  const arr = [...prices].sort((a, b) => a - b);
  return { min: arr[0], max: arr[arr.length - 1] };
}


export function formatVariantPriceRange(product: Product, formatPrice: (n: number) => string): string {
  const { min, max } = getVariantPriceBounds(product);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

export function hasSelectedVariantPrice(
  product: Product,
  activeVariants: Record<number, number>
): boolean {
  if (product.variantInventory?.length && product.variants?.length) {
    const picks = product.variants.map((_, gi) => activeVariants[gi] ?? 0);
    const key = picks.join(",");
    const found = product.variantInventory.find((e) => e.picks.join(",") === key);
    if (found?.price != null && found.price > 0) {
      return true;
    }
  }

  return (
    product.variants?.some((group, gi) => {
      const opt = group.options[activeVariants[gi] ?? 0];
      return opt?.price != null && opt.price > 0;
    }) ?? false
  );
}

export function getSelectedVariantLabel(
  product: Product,
  activeVariants: Record<number, number>
): string {
  if (!product.variants?.length) return "";
  return product.variants
    .map((g, gi) => g.options[activeVariants[gi] ?? 0]?.name)
    .filter(Boolean)
    .join(", ");
}

/** Galeri tampilan: foto varian terpilih di depan, lalu foto produk lainnya */
export function getGalleryImages(
  product: Product,
  activeVariants?: Record<number, number>
): string[] {
  const base = product.images?.length
    ? [...product.images]
    : product.img
      ? [product.img]
      : [];

  const variantOptionImages: string[] = [];
  product.variants?.forEach((group) => {
    group.options.forEach((opt) => {
      const img = opt.image?.trim();
      if (img && !variantOptionImages.includes(img) && !base.includes(img)) {
        variantOptionImages.push(img);
      }
    });
  });

  return [...base, ...variantOptionImages];
}

/** Grup varian yang punya foto di opsi (motif/warna) */
export function getSelectedVariantStock(
  product: Product,
  activeVariants: Record<number, number>
): number {
  if (!product.variantInventory?.length) return product.stok;

  const picks = product.variants?.map((_, gi) => activeVariants[gi] ?? 0) ?? [];
  return getStockForPicks(product.variantInventory, picks, product.stok);
}

export function getActiveVariantPicks(
  product: Product,
  activeVariants: Record<number, number>
): number[] {
  if (!product.variants?.length) return [];
  return product.variants.map((_, gi) => activeVariants[gi] ?? 0);
}

export function isVisualVariantGroup(
  product: Product,
  groupIndex: number
): boolean {
  const group = product.variants?.[groupIndex];
  return group?.options.some((o) => Boolean(o.image?.trim())) ?? false;
}
