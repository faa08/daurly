import { supabase } from "./supabase";

export interface ProductVariantOption {
  name: string;
  image?: string;
  price?: number;
}

export interface ProductVariant {
  label: string;
  options: ProductVariantOption[];
}

export interface ProductExtras {
  bahan?: string;
  asal_produk?: string;
  ketahanan?: string;
  info_tambahan?: string;
  variants?: ProductVariant[];
  berat?: number;
}

export interface Product {
  id_produk: string;
  id_seller: string;
  nama_produk: string;
  sku: string;
  category: string;
  categorySlug?: string;
  slug?: string;
  harga: number;
  stok: number;
  status: "Aktif" | "Stok Habis" | "Dalam Review";
  img: string;
  images?: string[];
  desc: string;
  created_at: string;
  nama_brand?: string;
  kode_produk?: string;
  variants?: ProductVariant[];
  bahan?: string;
  asal_produk?: string;
  ketahanan?: string;
  info_tambahan?: string;
  berat?: number;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

function parseVariants(raw: unknown): ProductVariant[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];

    const groups: ProductVariant[] = [];
    for (const v of parsed) {
      if (!v || typeof v.label !== "string") continue;
      const label = String(v.label).trim();
      if (!label) continue;

      if (Array.isArray(v.options)) {
        const options = v.options
          .map((o: Record<string, unknown>) => ({
            name: String(o.name ?? "").trim(),
            image: o.image ? String(o.image) : undefined,
            price: o.price != null && o.price !== "" ? Number(o.price) : undefined,
          }))
          .filter((o: { name: string }) => o.name);
        if (options.length) groups.push({ label, options });
        continue;
      }

      // format lama: { label, values: string[] }
      if (Array.isArray(v.values)) {
        const options = v.values
          .map((x: unknown) => ({ name: String(x).trim() }))
          .filter((o: { name: string }) => o.name);
        if (options.length) groups.push({ label, options });
      }
    }
    return groups;
  } catch {
    return [];
  }
}

type GetProductsOptions = {
  /** Hanya produk dari toko aktif dengan stok tersedia (untuk halaman publik) */
  publicOnly?: boolean;
  limit?: number;
  /** Muat semua kolom (termasuk gambar/deskripsi penuh) — hanya untuk admin */
  includeFullDetails?: boolean;
  /** Muat kolom img untuk thumbnail (admin / toko mitra) */
  includeImages?: boolean;
};

function buildListSelect(publicOnly?: boolean, includeImages?: boolean) {
  const sellerRel = publicOnly ? "seller!inner" : "seller";
  const imgCol = includeImages ? ", img" : "";
  return `
    id_produk, id_seller, id_kategori, nama_produk, slug, harga, berat,
    bahan, asal_produk, ketahanan, produk_stock, stat_produk, created_at, cover_img${imgCol},
    kategori ( id_kategori, nama_kategori ),
    ${sellerRel} ( id_seller, nm_store, is_verified )
  `;
}

const PRODUCT_FULL_SELECT = `
  *,
  kategori ( id_kategori, nama_kategori ),
  seller ( id_seller, nm_store, is_verified )
`;

/** URL/thumbnail ringan untuk listing — hindari base64 besar di query list */
function extractCoverImg(img: string | null | undefined): string | null {
  if (!img) return null;
  const trimmed = img.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
    return trimmed.length <= 2048 ? trimmed : trimmed.slice(0, 2048);
  }
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
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
  return trimmed.length <= 2048 ? trimmed : null;
}

function resolveProductImages(cover_img?: string | null, img?: string | null): { cover: string; images: string[] } {
  const fallback = "/product-keramik.png";
  const coverUrl = cover_img?.trim();
  if (coverUrl) {
    return { cover: coverUrl, images: [coverUrl] };
  }

  const raw = img?.trim();
  if (!raw) {
    return { cover: fallback, images: [] };
  }

  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown[];
      const images = parsed.map((item) => String(item ?? "").trim()).filter(Boolean);
      if (images.length > 0) {
        return { cover: images[0], images };
      }
    } catch {
      // lanjut ke single string
    }
  }

  return { cover: raw, images: [raw] };
}

const mapDbRowToProduct = (p: Record<string, unknown>): Product => {
  const rawKategori = Array.isArray(p.kategori) ? p.kategori[0] : p.kategori;
  const cat = rawKategori as { id_kategori?: string; nama_kategori?: string } | null | undefined;
  const catName = cat?.nama_kategori || "UMKM Lokal";
  const catSlug = cat?.nama_kategori ? slugify(cat.nama_kategori) : "kerajinan";

  const rawSeller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
  const seller = rawSeller as { nm_store?: string; is_verified?: boolean } | null | undefined;

  const { cover: coverImg, images } = resolveProductImages(
    p.cover_img as string | undefined,
    p.img as string | undefined
  );

  const idProduk = p.id_produk as string;
  const slug = (p.slug as string) || idProduk;

  return {
    id_produk: idProduk,
    id_seller: p.id_seller as string,
    nama_produk: p.nama_produk as string,
    sku: `SKU-${idProduk.replace(/-/g, "").substring(0, 8).toUpperCase()}`,
    category: catName,
    categorySlug: catSlug,
    slug,
    harga: Number(p.harga),
    stok: Number(p.produk_stock),
    status: Number(p.produk_stock) > 0 ? "Aktif" : "Stok Habis",
    img: coverImg,
    images,
    desc: (p.desc as string) || "",
    created_at: (p.created_at as string) || new Date().toISOString(),
    nama_brand: seller?.nm_store || "UMKM Lokal",
    kode_produk: `PRD-${idProduk.substring(0, 8).toUpperCase()}`,
    berat: Number(p.berat) || 0,
    bahan: (p.bahan as string) || undefined,
    asal_produk: (p.asal_produk as string) || undefined,
    ketahanan: (p.ketahanan as string) || undefined,
    info_tambahan: (p.info_tambahan as string) || undefined,
    variants: parseVariants(p.varian),
  };
};

const logSupabaseError = (label: string, error: { message?: string; details?: string; hint?: string; code?: string }) => {
  console.error(label, error.message || error, {
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
};

export const productService = {
  // Get all categories
  async getCategories(): Promise<{ id_kategori: string; nama_kategori: string }[]> {
    console.log("Calling productService.getCategories");

    if (isPlaceholder()) {
      return [
        { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
        { id_kategori: "cat-2", nama_kategori: "Tekstil" },
        { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
        { id_kategori: "cat-4", nama_kategori: "Kuliner" }
      ];
    }

    try {
      const { data, error } = await supabase
        .from("kategori")
        .select("*")
        .order("nama_kategori", { ascending: true });

      if (error) {
        console.error("Supabase get categories error:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [
          { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
          { id_kategori: "cat-2", nama_kategori: "Tekstil" },
          { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
          { id_kategori: "cat-4", nama_kategori: "Kuliner" }
        ];
      }

      return data;
    } catch (err) {
      console.error("productService getCategories failed:", err);
      return [];
    }
  },

  // Get all products (query ringan — tanpa img/varian/deskripsi penuh kecuali includeFullDetails)
  async getProducts(options?: GetProductsOptions): Promise<Product[]> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      let products: Product[] = stored ? JSON.parse(stored) : [];
      if (options?.publicOnly) {
        products = products.filter((p) => p.stok > 0 && p.status !== "Stok Habis");
      }
      const cap = options?.limit ?? 200;
      products = products.slice(0, cap);
      return products;
    }

    try {
      const selectCols = options?.includeFullDetails
        ? PRODUCT_FULL_SELECT
        : buildListSelect(options?.publicOnly, options?.includeImages);
      const cap = options?.limit ?? 200;

      let query = supabase
        .from("produk")
        .select(selectCols)
        .order("created_at", { ascending: false })
        .limit(cap);

      if (options?.publicOnly) {
        query = query
          .eq("stat_produk", "tersedia")
          .gt("produk_stock", 0)
          .eq("seller.is_verified", true);
      }

      const { data, error } = await query;

      if (error) {
        logSupabaseError("Supabase get products error:", error);
        return [];
      }

      return (data || []).map((p) => mapDbRowToProduct(p as unknown as Record<string, unknown>));
    } catch (err) {
      console.error("productService getProducts failed:", err);
      return [];
    }
  },

  // Get products by seller ID
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        return products.filter(p => p.id_seller === sellerId);
      }
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("produk")
        .select(buildListSelect(false, true))
        .eq("id_seller", sellerId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        logSupabaseError("Supabase get products by seller error:", error);
        return [];
      }

      return (data || []).map((p) => mapDbRowToProduct(p as unknown as Record<string, unknown>));
    } catch (err) {
      console.error("productService getProductsBySeller failed:", err);
      return [];
    }
  },

  // Add / Publish product
  async addProduct(
    sellerId: string,
    nama_produk: string,
    id_kategori: string | null,
    harga: number,
    stok: number,
    desc: string,
    img?: string | string[],
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif",
    nama_brand?: string,
    kode_produk?: string,
    extras?: ProductExtras
  ): Promise<Product | null> {
    console.log("Calling productService.addProduct for product:", nama_produk);

    const generatedId = typeof crypto !== "undefined" ? crypto.randomUUID() : `p-${Math.random().toString(36).substr(2, 9)}`;
    const productSlug = `${slugify(nama_produk)}-${generatedId.substr(0, 4)}`;
    const finalKodeProduk = kode_produk || `PRD-${generatedId.substr(0, 8).toUpperCase()}`;

    // Resolve category name from id_kategori
    let catName = "UMKM Lokal";
    if (id_kategori) {
      const mockCats = [
        { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
        { id_kategori: "cat-2", nama_kategori: "Tekstil" },
        { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
        { id_kategori: "cat-4", nama_kategori: "Kuliner" }
      ];
      const foundMock = mockCats.find(c => c.id_kategori === id_kategori);
      if (foundMock) {
        catName = foundMock.nama_kategori;
      } else if (!isPlaceholder()) {
        try {
          const { data: catData } = await supabase
            .from("kategori")
            .select("nama_kategori")
            .eq("id_kategori", id_kategori)
            .maybeSingle();
          if (catData) {
            catName = catData.nama_kategori;
          }
        } catch (e) {
          console.error("Error resolving category name:", e);
        }
      }
    }

    const finalImg = Array.isArray(img) ? JSON.stringify(img) : (img || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop");
    
    let images: string[] = [];
    let coverImg = "/product-keramik.png";
    if (Array.isArray(img)) {
      images = img;
      coverImg = img[0] || "/product-keramik.png";
    } else if (img) {
      try {
        if (img.startsWith("[") && img.endsWith("]")) {
          images = JSON.parse(img);
          coverImg = images[0] || "/product-keramik.png";
        } else {
          images = [img];
          coverImg = img;
        }
      } catch {
        images = [img];
        coverImg = img;
      }
    } else {
      images = [finalImg];
      coverImg = finalImg;
    }

    const newProduct: Product = {
      id_produk: generatedId,
      id_seller: sellerId,
      nama_produk,
      sku: `SKU-${generatedId.substring(0, 4).toUpperCase()}`,
      category: catName,
      categorySlug: slugify(catName),
      slug: productSlug,
      harga,
      stok,
      status,
      img: coverImg,
      images: images,
      desc: desc || "Deskripsi produk baru",
      created_at: new Date().toISOString(),
      nama_brand: nama_brand || "UMKM Lokal",
      kode_produk: finalKodeProduk,
      berat: extras?.berat || 0,
      bahan: extras?.bahan,
      asal_produk: extras?.asal_produk,
      ketahanan: extras?.ketahanan,
      info_tambahan: extras?.info_tambahan,
      variants: extras?.variants || [],
    };

    if (isPlaceholder()) {
      console.warn("Using fallback local storage add product");
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? JSON.parse(stored) : [];
      products.push({ ...newProduct, img: finalImg });
      localStorage.setItem("pelum_products", JSON.stringify(products));
      return newProduct;
    }

    const dbCategoryId = id_kategori && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_kategori)
      ? id_kategori
      : null;

    try {
      const { data: sellerRow, error: sellerError } = await supabase
        .from("seller")
        .select("id_seller")
        .eq("id_seller", sellerId)
        .maybeSingle();

      if (sellerError) {
        logSupabaseError("Supabase verify seller error:", sellerError);
        return null;
      }
      if (!sellerRow) {
        console.error("Toko tidak ditemukan untuk id_seller:", sellerId);
        return null;
      }

      const insertPayload: Record<string, unknown> = {
        id_produk: newProduct.id_produk,
        id_seller: newProduct.id_seller,
        nama_produk: newProduct.nama_produk,
        slug: productSlug,
        desc: newProduct.desc,
        harga: newProduct.harga,
        produk_stock: newProduct.stok,
        stat_produk: newProduct.stok > 0 ? "tersedia" : "tidak tersedia",
        img: finalImg,
        cover_img: extractCoverImg(finalImg),
        berat: newProduct.berat || 0,
        bahan: newProduct.bahan || null,
        asal_produk: newProduct.asal_produk || null,
        ketahanan: newProduct.ketahanan || null,
        info_tambahan: newProduct.info_tambahan || null,
        varian: newProduct.variants || [],
      };
      if (dbCategoryId) {
        insertPayload.id_kategori = dbCategoryId;
      }

      const { error } = await supabase.from("produk").insert(insertPayload);

      if (error) {
        logSupabaseError("Supabase insert product error:", error);
        return null;
      }

      return newProduct;
    } catch (err) {
      console.error("productService addProduct failed:", err);
      return null;
    }
  },

  // Update product details
  async updateProduct(
    id_produk: string,
    nama_produk: string,
    id_kategori: string | null,
    harga: number,
    stok: number,
    desc: string,
    img?: string | string[],
    status: "Aktif" | "Stok Habis" | "Dalam Review" = "Aktif",
    nama_brand?: string,
    kode_produk?: string,
    extras?: ProductExtras
  ): Promise<boolean> {
    console.log("Calling productService.updateProduct for ID:", id_produk);

    const finalImg = Array.isArray(img) ? JSON.stringify(img) : img;

    if (isPlaceholder()) {
      console.warn("Using fallback local storage update product");
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const idx = products.findIndex(p => p.id_produk === id_produk);
        if (idx !== -1) {
          let catName = "UMKM Lokal";
          if (id_kategori) {
            const mockCats = [
              { id_kategori: "cat-1", nama_kategori: "Fashion Pria" },
              { id_kategori: "cat-2", nama_kategori: "Tekstil" },
              { id_kategori: "cat-3", nama_kategori: "Aksesoris" },
              { id_kategori: "cat-4", nama_kategori: "Kuliner" }
            ];
            const foundMock = mockCats.find(c => c.id_kategori === id_kategori);
            if (foundMock) catName = foundMock.nama_kategori;
          }

          let images: string[] = [];
          let coverImg = "/product-keramik.png";
          if (Array.isArray(img)) {
            images = img;
            coverImg = img[0] || "/product-keramik.png";
          } else if (img) {
            try {
              if (img.startsWith("[") && img.endsWith("]")) {
                images = JSON.parse(img);
                coverImg = images[0] || "/product-keramik.png";
              } else {
                images = [img];
                coverImg = img;
              }
            } catch {
              images = [img];
              coverImg = img;
            }
          }

          products[idx] = {
            ...products[idx],
            nama_produk,
            category: catName,
            harga,
            stok,
            status,
            img: coverImg,
            images: images,
            desc,
            nama_brand: nama_brand || products[idx].nama_brand,
            kode_produk: kode_produk || products[idx].kode_produk,
            berat: extras?.berat ?? products[idx].berat ?? 0,
            bahan: extras?.bahan ?? products[idx].bahan,
            asal_produk: extras?.asal_produk ?? products[idx].asal_produk,
            ketahanan: extras?.ketahanan ?? products[idx].ketahanan,
            info_tambahan: extras?.info_tambahan ?? products[idx].info_tambahan,
            variants: extras?.variants ?? products[idx].variants ?? [],
          };
          localStorage.setItem("pelum_products", JSON.stringify(products));
          return true;
        }
      }
      return false;
    }

    const dbCategoryId = id_kategori && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_kategori)
      ? id_kategori
      : null;

    try {
      const updatePayload: Record<string, unknown> = {
        nama_produk,
        harga,
        produk_stock: stok,
        stat_produk: stok > 0 ? "tersedia" : "tidak tersedia",
        img: finalImg,
        cover_img: extractCoverImg(typeof finalImg === "string" ? finalImg : null),
        desc,
        berat: extras?.berat ?? 0,
        bahan: extras?.bahan || null,
        asal_produk: extras?.asal_produk || null,
        ketahanan: extras?.ketahanan || null,
        info_tambahan: extras?.info_tambahan || null,
        varian: extras?.variants || [],
        updated_at: new Date().toISOString(),
      };
      if (dbCategoryId) {
        updatePayload.id_kategori = dbCategoryId;
      } else {
        updatePayload.id_kategori = null;
      }

      const { error } = await supabase
        .from("produk")
        .update(updatePayload)
        .eq("id_produk", id_produk);

      if (error) {
        logSupabaseError("Supabase update product error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService.updateProduct failed:", err);
      return false;
    }
  },

  // Delete all products belonging to a seller (used when deleting a store)
  async deleteProductsBySeller(sellerId: string): Promise<boolean> {
    console.log("Calling productService.deleteProductsBySeller for:", sellerId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const updated = products.filter((p) => p.id_seller !== sellerId);
        localStorage.setItem("pelum_products", JSON.stringify(updated));
      }
      return true;
    }

    try {
      const { error } = await supabase.from("produk").delete().eq("id_seller", sellerId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("productService deleteProductsBySeller failed:", err);
      return false;
    }
  },

  // Delete product by id (preferred) or legacy SKU string
  async deleteProduct(idOrSku: string): Promise<boolean> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSku);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const updated = products.filter((p) =>
          isUuid ? p.id_produk !== idOrSku : p.sku !== idOrSku
        );
        localStorage.setItem("pelum_products", JSON.stringify(updated));
        return true;
      }
      return false;
    }

    try {
      if (isUuid) {
        const { error } = await supabase.from("produk").delete().eq("id_produk", idOrSku);
        if (error) {
          console.error("Supabase delete product error:", error);
          return false;
        }
        return true;
      }

      const { data: allProducts, error: fetchErr } = await supabase
        .from("produk")
        .select("id_produk, slug");

      if (fetchErr) {
        console.error("Supabase fetch for delete error:", fetchErr);
        return false;
      }

      const productToDelete = (allProducts || []).find((p: { id_produk: string; slug?: string }) => {
        const mappedSku = p.slug
          ? `SKU-${p.slug.substring(0, 4).toUpperCase()}`
          : `SKU-${p.id_produk.substring(0, 4).toUpperCase()}`;
        return mappedSku === idOrSku;
      });

      if (!productToDelete) return false;

      const { error } = await supabase
        .from("produk")
        .delete()
        .eq("id_produk", productToDelete.id_produk);

      if (error) {
        console.error("Supabase delete product error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService deleteProduct failed:", err);
      return false;
    }
  },

  // Get product by Slug or UUID ID
  async getProductBySlugOrId(slugOrId: string): Promise<any | null> {
    console.log("Calling productService.getProductBySlugOrId:", slugOrId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      const products = stored ? JSON.parse(stored) : [];
      const item = products.find((p: any) => p.id_produk === slugOrId || p.slug === slugOrId || p.sku === slugOrId);
      if (item) {
        const mapped = mapDbRowToProduct({
          ...item,
          varian: item.varian ?? item.variants,
          produk_stock: item.produk_stock ?? item.stok,
        } as Record<string, unknown>);
        return {
          ...mapped,
          seller: {
            id_seller: item.id_seller,
            nm_store: "Toko Mitra UMKM",
            logo_toko: "",
            is_verified: true,
          },
        };
      }
      return null;
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      
      let query = supabase
        .from("produk")
        .select(`
          *,
          seller ( id_seller, nm_store, logo_toko, is_verified, deskripsi, addr, no_telp, created_at ),
          kategori ( id_kategori, nama_kategori )
        `);

      if (isUuid) {
        query = query.eq("id_produk", slugOrId);
      } else {
        query = query.eq("slug", slugOrId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const mapped = mapDbRowToProduct(data as unknown as Record<string, unknown>);
      return {
        ...mapped,
        seller: data.seller,
        kategori: data.kategori,
      };
    } catch (err) {
      console.error("productService.getProductBySlugOrId failed:", err);
      return null;
    }
  },

  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<any[]> {
    if (isPlaceholder()) {
      const reviews = JSON.parse(localStorage.getItem(`pelum_reviews_${productId}`) || "[]");
      return reviews;
    }

    try {
      const { data, error } = await supabase
        .from("review")
        .select(`
          id_review, rating, komentar, foto_review, created_at,
          users ( nama_lengkap, username, avatar )
        `)
        .eq("id_produk", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((r: any) => {
        const user = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          id: r.id_review,
          name: user?.nama_lengkap || user?.username || "Pembeli",
          avatar: (user?.nama_lengkap || user?.username || "P").substring(0, 2).toUpperCase(),
          time: new Date(r.created_at).toLocaleDateString("id-ID"),
          rating: r.rating,
          text: r.komentar,
          image: r.foto_review
        };
      });
    } catch (err) {
      console.error("productService.getProductReviews failed:", err);
      return [];
    }
  },

  // Submit product review
  async submitReview(
    userId: string,
    productId: string,
    rating: number,
    comment: string,
    photoReview?: string
  ): Promise<boolean> {
    if (isPlaceholder()) {
      const key = `pelum_reviews_${productId}`;
      const reviews = JSON.parse(localStorage.getItem(key) || "[]");
      
      // Get user name
      const users = JSON.parse(localStorage.getItem("pelum_users") || "[]");
      const user = users.find((u: any) => u.id_user === userId);
      const name = user ? (user.nama_lengkap || user.username) : "Siti Rahayu";
      
      reviews.unshift({
        id: Math.random().toString(36).substring(2, 9),
        name,
        avatar: name.substring(0, 2).toUpperCase(),
        time: "Baru saja",
        rating,
        text: comment,
        image: photoReview || null
      });
      localStorage.setItem(key, JSON.stringify(reviews));
      return true;
    }

    try {
      const { error } = await supabase
        .from("review")
        .insert({
          id_user: userId,
          id_produk: productId,
          rating,
          komentar: comment,
          foto_review: photoReview || null
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("productService.submitReview failed:", err);
      return false;
    }
  },

  // Update product stock
  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    console.log(`Calling productService.updateProductStock for product ${productId} to ${newStock}`);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_products");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        const idx = products.findIndex(p => p.id_produk === productId);
        if (idx !== -1) {
          products[idx].stok = newStock;
          products[idx].status = newStock > 0 ? "Aktif" : "Stok Habis";
          localStorage.setItem("pelum_products", JSON.stringify(products));
          return true;
        }
      }
      return false;
    }

    try {
      const stat_produk = newStock > 0 ? "tersedia" : "tidak tersedia";
      const { error } = await supabase
        .from("produk")
        .update({
          produk_stock: newStock,
          stat_produk: stat_produk,
          updated_at: new Date().toISOString()
        })
        .eq("id_produk", productId);

      if (error) {
        console.error("Supabase update stock error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("productService.updateProductStock failed:", err);
      return false;
    }
  },

  async getProductStats(
    productIds: string[]
  ): Promise<Record<string, { rating: number; sold: number; reviewCount: number }>> {
    const result: Record<string, { rating: number; sold: number; reviewCount: number }> = {};
    if (!productIds.length) return result;

    for (const id of productIds) {
      result[id] = { rating: 0, sold: 0, reviewCount: 0 };
    }

    if (isPlaceholder()) return result;

    try {
      const { data: reviews } = await supabase
        .from("review")
        .select("id_produk, rating")
        .in("id_produk", productIds);

      if (reviews) {
        const buckets = new Map<string, number[]>();
        for (const r of reviews) {
          const list = buckets.get(r.id_produk) || [];
          list.push(Number(r.rating));
          buckets.set(r.id_produk, list);
        }
        for (const [id, ratings] of buckets) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          result[id] = { ...result[id], rating: Math.round(avg * 10) / 10, reviewCount: ratings.length };
        }
      }

      const { data: orderItems } = await supabase
        .from("order_item")
        .select("id_produk, qty_orderitem, order!inner ( stat_order )")
        .in("id_produk", productIds)
        .eq("order.stat_order", "selesai");

      if (orderItems) {
        for (const item of orderItems) {
          const cur = result[item.id_produk];
          if (cur) {
            cur.sold += Number(item.qty_orderitem);
          }
        }
      }
    } catch (err) {
      console.error("productService.getProductStats failed:", err);
    }

    return result;
  },

  async searchProducts(query: string, limit = 50): Promise<Product[]> {
    const all = await this.getProducts({ publicOnly: true, limit: 200, includeImages: true });
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, limit);
    return all
      .filter(
        (p) =>
          p.nama_produk.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.desc && p.desc.toLowerCase().includes(q))
      )
      .slice(0, limit);
  },

  async getSimilarProducts(
    productId: string,
    categorySlug?: string,
    sellerId?: string,
    limit = 5
  ): Promise<Product[]> {
    const all = await this.getProducts({ publicOnly: true, limit: 100 });
    const filtered = all.filter((p) => {
      if (p.id_produk === productId) return false;
      if (categorySlug && p.categorySlug === categorySlug) return true;
      if (sellerId && p.id_seller === sellerId) return true;
      return false;
    });
    if (filtered.length >= limit) return filtered.slice(0, limit);
    const rest = all.filter((p) => p.id_produk !== productId && !filtered.includes(p));
    return [...filtered, ...rest].slice(0, limit);
  },

  async getStoreReviews(sellerId: string): Promise<
    { id: string; user: string; rating: number; time: string; text: string }[]
  > {
    if (isPlaceholder()) return [];

    try {
      const { data, error } = await supabase
        .from("review_toko")
        .select(`id_review_toko, rating, komentar, created_at, users ( nama_lengkap, username )`)
        .eq("id_seller", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => {
        const user = Array.isArray(r.users) ? r.users[0] : r.users;
        const u = user as { nama_lengkap?: string; username?: string } | null;
        const name = u?.nama_lengkap || u?.username || "Pembeli";
        return {
          id: r.id_review_toko as string,
          user: name,
          rating: Number(r.rating),
          time: new Date(r.created_at as string).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          text: (r.komentar as string) || "",
        };
      });
    } catch (err) {
      console.error("productService.getStoreReviews failed:", err);
      return [];
    }
  },
};
